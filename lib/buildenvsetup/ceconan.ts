// Copyright (c) 2020, Compiler Explorer Authors
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import path from 'path';
import zlib from 'zlib';

import fs, {mkdirp} from 'fs-extra';
import request from 'request';
import tar from 'tar-stream';
import _ from 'underscore';

import {CacheKey} from '../../types/compilation/compilation.interfaces.js';
import {CompilerInfo} from '../../types/compiler.interfaces.js';
import {CompilationEnvironment} from '../compilation-env.js';
import {logger} from '../logger.js';
import {VersionInfo} from '../options-handler.js';
import * as utils from '../utils.js';

import {BuildEnvSetupBase} from './base.js';
import type {BuildEnvDownloadInfo} from './buildenv.interfaces.js';

export type ConanBuildProperties = {
    os: string;
    build_type: string;
    compiler: string;
    'compiler.version': string;
    'compiler.libcxx': string;
    arch: string;
    stdver: string;
    flagcollection: string;
};

type LibVerBuild = {
    id: string;
    version: string;
    lookupname: string;
    lookupversion: string;
    possibleBuilds: any;
};

export class BuildEnvSetupCeConanDirect extends BuildEnvSetupBase {
    protected host: any;
    protected onlyonstaticliblink: any;
    protected extractAllToRoot: boolean;

    static get key() {
        return 'ceconan';
    }

    constructor(compilerInfo: CompilerInfo, env: CompilationEnvironment) {
        super(compilerInfo, env);

        this.host = compilerInfo.buildenvsetup!.props('host', '');
        this.onlyonstaticliblink = compilerInfo.buildenvsetup!.props('onlyonstaticliblink', '');
        this.extractAllToRoot = false;
    }

    async getAllPossibleBuilds(libid: string, version: string) {
        return new Promise((resolve, reject) => {
            const encLibid = encodeURIComponent(libid);
            const encVersion = encodeURIComponent(version);
            const url = `${this.host}/v1/conans/${encLibid}/${encVersion}/${encLibid}/${encVersion}/search`;
            const settings = {
                method: 'GET',
                json: true,
            };

            request(url, settings, (err, res, body) => {
                if (err) {
                    logger.error(`Unexpected error during getAllPossibleBuilds(${libid}, ${version}): `, err);
                    reject(err);
                } else if (res && res.statusCode === 404) {
                    reject(`Not found (${url})`);
                } else {
                    resolve(body);
                }
            });
        });
    }

    async getPackageUrl(libid: string, version: string, hash: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const encLibid = encodeURIComponent(libid);
            const encVersion = encodeURIComponent(version);
            const libUrl = `${this.host}/v1/conans/${encLibid}/${encVersion}/${encLibid}/${encVersion}`;
            const url = `${libUrl}/packages/${hash}/download_urls`;

            const settings = {
                method: 'GET',
                json: true,
            };

            request(url, settings, (err, res: request.Response, body) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(body['conan_package.tgz']);
            });
        });
    }

    getDestinationFilepath(downloadPath: string, zippedPath: string, libId: string): string {
        if (this.extractAllToRoot) {
            const filename = path.basename(zippedPath);
            return path.join(downloadPath, filename);
        } else {
            return path.join(downloadPath, libId, zippedPath);
        }
    }

    async downloadAndExtractPackage(
        libId: string,
        version: string,
        downloadPath: string,
        packageUrl: string,
    ): Promise<BuildEnvDownloadInfo> {
        return new Promise((resolve, reject) => {
            const startTime = process.hrtime.bigint();
            const extract = tar.extract();
            const gunzip = zlib.createGunzip();

            extract.on('entry', async (header, stream, next) => {
                try {
                    const filepath = this.getDestinationFilepath(downloadPath, header.name, libId);

                    const resolved = path.resolve(path.dirname(filepath));
                    if (!resolved.startsWith(downloadPath)) {
                        logger.error(`Library ${libId}/${version} is using a zip-slip, skipping file`);
                        stream.resume();
                        next();
                        return;
                    }

                    if (!this.extractAllToRoot) {
                        await mkdirp(path.dirname(filepath));
                    }

                    const filestream = fs.createWriteStream(filepath);
                    if (header.size === 0) {
                        // See https://github.com/mafintosh/tar-stream/issues/145
                        stream.resume();
                        next();
                    } else {
                        stream
                            .on('error', (error: any) => {
                                logger.error(`Error in stream handling: ${error}`);
                                reject(error);
                            })
                            .on('end', next)
                            .pipe(filestream);
                        stream.resume();
                    }
                } catch (error) {
                    logger.error(`Error in entry handling: ${error}`);
                    reject(error);
                }
            });

            extract
                .on('error', (error: any) => {
                    logger.error(`Error in tar handling: ${error}`);
                    reject(error);
                })
                .on('finish', () => {
                    const endTime = process.hrtime.bigint();
                    resolve({
                        step: `Download of ${libId} ${version}`,
                        packageUrl: packageUrl,
                        time: utils.deltaTimeNanoToMili(startTime, endTime),
                    });
                });

            gunzip
                .on('error', error => {
                    logger.error(`Error in gunzip handling: ${error}`);
                    reject(error);
                })
                .pipe(extract);

            const settings = {
                method: 'GET',
                encoding: null,
            };

            // https://stackoverflow.com/questions/49277790/how-to-pipe-npm-request-only-if-http-200-is-received
            const req = request(packageUrl, settings)
                .on('error', (error: any) => {
                    logger.error(`Error in request handling: ${error}`);
                    reject(error);
                })
                .on('response', (res: request.Response) => {
                    if (res.statusCode === 200) {
                        req.pipe(gunzip);
                    } else {
                        logger.error(`Error requesting package from conan: ${res.statusCode} for ${packageUrl}`);
                        reject(new Error(`Unable to request library from conan: ${res.statusCode}`));
                    }
                });
        });
    }

    async getConanBuildProperties(key: CacheKey): Promise<ConanBuildProperties> {
        const arch = this.getTarget(key);
        const libcxx = this.getLibcxx(key);
        const stdver = '';
        const flagcollection = '';

        return {
            os: 'Linux',
            build_type: 'Debug',
            compiler: this.compilerTypeOrGCC,
            'compiler.version': this.compiler.id,
            'compiler.libcxx': libcxx,
            arch: arch,
            stdver: stdver,
            flagcollection: flagcollection,
        };
    }

    async findMatchingHash(buildProperties: ConanBuildProperties, possibleBuilds: any) {
        return _.findKey(possibleBuilds, elem => {
            return _.all(buildProperties, (val, key) => {
                if ((key === 'compiler' || key === 'compiler.version') && elem.settings[key] === 'cshared') {
                    return true;
                } else if (key === 'compiler.libcxx' && elem.settings['compiler'] === 'cshared') {
                    return true;
                } else {
                    return val === elem.settings[key];
                }
            });
        });
    }

    async download(
        key: CacheKey,
        dirPath: string,
        libraryDetails: Record<string, VersionInfo>,
    ): Promise<BuildEnvDownloadInfo[]> {
        const allDownloads: Promise<BuildEnvDownloadInfo>[] = [];
        const allLibraryBuilds: LibVerBuild[] = [];

        _.each(libraryDetails, (details: VersionInfo, libId: string) => {
            if (details.packagedheaders || this.hasBinariesToLink(details)) {
                const lookupname = details.lookupname || libId;
                const lookupversion = details.lookupversion || details.version;
                allLibraryBuilds.push({
                    id: libId,
                    version: details.version,
                    lookupname: details.lookupname as string,
                    lookupversion: details.lookupversion as string,
                    possibleBuilds: this.getAllPossibleBuilds(lookupname as string, lookupversion as string).catch(
                        () => false,
                    ),
                });
            }
        });

        const buildProperties = await this.getConanBuildProperties(key);

        for (const libVerBuilds of allLibraryBuilds) {
            const lookupname = libVerBuilds.lookupname || libVerBuilds.id;
            const lookupversion = libVerBuilds.lookupversion || libVerBuilds.version;
            const libVer = `${lookupname}/${lookupversion}`;
            const possibleBuilds = await libVerBuilds.possibleBuilds;
            if (possibleBuilds) {
                const hash = await this.findMatchingHash(buildProperties, possibleBuilds);
                if (hash) {
                    logger.debug(`Found conan hash ${hash} for ${libVer}`);
                    allDownloads.push(
                        this.getPackageUrl(lookupname, lookupversion, hash).then(downloadUrl => {
                            return this.downloadAndExtractPackage(libVerBuilds.id, lookupversion, dirPath, downloadUrl);
                        }),
                    );
                } else {
                    logger.warn(`No build found for ${libVer} matching ${JSON.stringify(buildProperties)}`);
                }
            } else {
                logger.warn(`Library ${libVer} not available`);
            }
        }

        return Promise.all(allDownloads);
    }

    override async setup(
        key: CacheKey,
        dirPath: string,
        libraryDetails: Record<string, VersionInfo>,
        binary: boolean,
    ): Promise<BuildEnvDownloadInfo[]> {
        if (!this.host) return [];

        if (this.onlyonstaticliblink && !binary) return [];

        const librariesToDownload = _.pick(libraryDetails, (details: VersionInfo) => {
            return this.shouldDownloadPackage(details);
        }) as Record<string, VersionInfo>;

        return this.download(key, dirPath, librariesToDownload);
    }
}
