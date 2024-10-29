// Copyright (c) 2017, Compiler Explorer Authors
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

import fs from 'fs-extra';

import type {Language, LanguageKey} from '../types/languages.interfaces.js';

type DefKeys =
    | 'name'
    | 'monaco'
    | 'extensions'
    | 'alias'
    | 'previewFilter'
    | 'formatter'
    | 'logoUrl'
    | 'logoUrlDark'
    | 'monacoDisassembly'
    | 'tooltip'
    | 'digitSeparator';
type LanguageDefinition = Pick<Language, DefKeys>;

const definitions: Record<LanguageKey, LanguageDefinition> = {
    coccinelle_for_c: {
        name: 'C with Coccinelle',
        monaco: 'nc',
        extensions: ['.c', '.h'],
        alias: [],
        logoUrl: 'c.svg',
        logoUrlDark: null,
        formatter: 'clangformat',
        previewFilter: /^\s*#include/,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    coccinelle_for_cpp: {
        name: 'C++ with Coccinelle',
        monaco: 'cppp',
        extensions: ['.cpp', '.h'],
        alias: [],
        logoUrl: 'c++.svg',
        logoUrlDark: null,
        formatter: 'clangformat',
        previewFilter: /^\s*#include/,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    jakt: {
        name: 'Jakt',
        monaco: 'jakt',
        extensions: ['.jakt'],
        alias: [],
        logoUrl: '',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: 'cppp',
    },
    'c++': {
        name: 'C++',
        monaco: 'cppp',
        extensions: ['.cpp', '.cxx', '.h', '.hpp', '.hxx', '.c', '.cc', '.ixx'],
        alias: ['gcc', 'cpp'],
        logoUrl: 'c++.svg',
        logoUrlDark: null,
        formatter: 'clangformat',
        previewFilter: /^\s*#include/,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    ada: {
        name: 'Ada',
        monaco: 'ada',
        extensions: ['.adb', '.ads'],
        alias: [],
        logoUrl: 'ada.svg',
        logoUrlDark: 'ada-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    analysis: {
        name: 'Analysis',
        monaco: 'asm',
        extensions: ['.asm'], // maybe add more? Change to a unique one?
        alias: ['tool', 'tools'],
        logoUrl: 'analysis.png', // TODO: Find a better alternative
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        tooltip: 'A collection of asm analysis tools',
    },
    'android-java': {
        name: 'Android Java',
        monaco: 'java',
        extensions: ['.java'],
        alias: [],
        logoUrl: 'android.svg',
        logoUrlDark: 'android-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    'android-kotlin': {
        name: 'Android Kotlin',
        monaco: 'kotlin',
        extensions: ['.kt'],
        alias: [],
        logoUrl: 'android.svg',
        logoUrlDark: 'android-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    assembly: {
        name: 'Assembly',
        monaco: 'asm',
        extensions: ['.asm', '.6502', '.s'],
        alias: ['asm'],
        logoUrl: 'assembly.png', // TODO: Find a better alternative
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    c: {
        name: 'C',
        monaco: 'nc',
        extensions: ['.c', '.h'],
        alias: [],
        logoUrl: 'c.svg',
        logoUrlDark: null,
        formatter: 'clangformat',
        previewFilter: /^\s*#include/,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    c3: {
        name: 'C3',
        monaco: 'c3',
        extensions: ['.c3'],
        alias: [],
        logoUrl: 'c3.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    carbon: {
        name: 'Carbon',
        monaco: 'carbon',
        extensions: ['.carbon'],
        alias: [],
        logoUrl: 'carbon.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    circle: {
        name: 'C++ (Circle)',
        monaco: 'cppcircle',
        extensions: ['.cpp', '.cxx', '.h', '.hpp', '.hxx', '.c'],
        alias: [],
        previewFilter: /^\s*#include/,
        logoUrl: 'c++.svg', // TODO: Find a better alternative
        logoUrlDark: null,
        formatter: null,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    circt: {
        name: 'CIRCT',
        monaco: 'mlir',
        extensions: ['.mlir'],
        alias: [],
        logoUrl: 'circt.svg',
        formatter: null,
        logoUrlDark: null,
        previewFilter: null,
        monacoDisassembly: 'mlir',
    },
    clean: {
        name: 'Clean',
        monaco: 'clean',
        extensions: ['.icl'],
        alias: [],
        logoUrl: 'clean.svg', // TODO: Find a better alternative
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    cmake: {
        name: 'CMake',
        monaco: 'cmake',
        extensions: ['.txt'],
        alias: [],
        logoUrl: 'cmake.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    cmakescript: {
        name: 'CMakeScript',
        monaco: 'cmake',
        extensions: ['.cmake'],
        alias: [],
        logoUrl: 'cmake.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    cobol: {
        name: 'COBOL',
        monaco: 'cobol',
        extensions: ['.cob', '.cbl', '.cobol'],
        alias: [],
        logoUrl: null, // TODO: Find a better alternative
        formatter: null,
        logoUrlDark: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    cpp_for_opencl: {
        name: 'C++ for OpenCL',
        monaco: 'cpp-for-opencl',
        extensions: ['.clcpp', '.cl', '.ocl'],
        alias: [],
        logoUrl: 'opencl.svg', // TODO: Find a better alternative
        logoUrlDark: 'opencl-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    mlir: {
        name: 'MLIR',
        monaco: 'mlir',
        extensions: ['.mlir'],
        alias: [],
        logoUrl: 'mlir.svg',
        formatter: null,
        logoUrlDark: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    cppx: {
        name: 'Cppx',
        monaco: 'cppp',
        extensions: ['.cpp', '.cxx', '.h', '.hpp', '.hxx', '.c'],
        alias: [],
        logoUrl: 'c++.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: /^\s*#include/,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    cppx_blue: {
        name: 'Cppx-Blue',
        monaco: 'cppx-blue',
        extensions: ['.blue', '.cpp', '.cxx', '.h', '.hpp', '.hxx', '.c'],
        alias: [],
        logoUrl: 'c++.svg', // TODO: Find a better alternative
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    cppx_gold: {
        name: 'Cppx-Gold',
        monaco: 'cppx-gold',
        extensions: ['.usyntax', '.cpp', '.cxx', '.h', '.hpp', '.hxx', '.c'],
        alias: [],
        logoUrl: 'c++.svg', // TODO: Find a better alternative
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    cpp2_cppfront: {
        name: 'Cpp2-cppfront',
        monaco: 'cpp2-cppfront',
        extensions: ['.cpp2'],
        alias: [],
        logoUrl: 'c++.svg', // TODO: Find a better alternative
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: 'cppp',
        digitSeparator: "'",
    },
    crystal: {
        name: 'Crystal',
        monaco: 'crystal',
        extensions: ['.cr'],
        alias: [],
        logoUrl: 'crystal.svg',
        logoUrlDark: 'crystal-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    csharp: {
        name: 'C#',
        monaco: 'csharp',
        extensions: ['.cs'],
        alias: [],
        logoUrl: 'dotnet.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    cuda: {
        name: 'CUDA C++',
        monaco: 'cuda',
        extensions: ['.cu'],
        alias: ['nvcc'],
        logoUrl: 'cuda.svg',
        logoUrlDark: 'cuda-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    d: {
        name: 'D',
        monaco: 'd',
        extensions: ['.d'],
        alias: [],
        logoUrl: 'd.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    dart: {
        name: 'Dart',
        monaco: 'dart',
        extensions: ['.dart'],
        alias: [],
        logoUrl: 'dart.svg',
        logoUrlDark: null,
        formatter: 'dartformat',
        previewFilter: null,
        monacoDisassembly: null,
    },
    elixir: {
        name: 'Elixir',
        monaco: 'elixir',
        extensions: ['.ex'],
        alias: [],
        logoUrl: 'elixir.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    erlang: {
        name: 'Erlang',
        monaco: 'erlang',
        extensions: ['.erl', '.hrl'],
        alias: [],
        logoUrl: 'erlang.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    fortran: {
        name: 'Fortran',
        monaco: 'fortran',
        extensions: ['.f90', '.F90', '.f95', '.F95', '.f'],
        alias: [],
        logoUrl: 'fortran.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    fsharp: {
        name: 'F#',
        monaco: 'fsharp',
        extensions: ['.fs'],
        alias: [],
        logoUrl: 'fsharp.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    glsl: {
        name: 'GLSL',
        monaco: 'glsl',
        extensions: ['.glsl'],
        alias: [],
        logoUrl: null,
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    go: {
        name: 'Go',
        monaco: 'go',
        extensions: ['.go'],
        alias: [],
        logoUrl: 'go.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    haskell: {
        name: 'Haskell',
        monaco: 'haskell',
        extensions: ['.hs', '.haskell'],
        alias: [],
        logoUrl: 'haskell.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    hlsl: {
        name: 'HLSL',
        monaco: 'hlsl',
        extensions: ['.hlsl', '.hlsli'],
        alias: [],
        logoUrl: 'hlsl.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    hook: {
        name: 'Hook',
        monaco: 'hook',
        extensions: ['.hk', '.hook'],
        alias: [],
        logoUrl: 'hook.png',
        logoUrlDark: 'hook-dark.png',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    hylo: {
        name: 'Hylo',
        monaco: 'hylo',
        extensions: ['.hylo'],
        alias: [],
        logoUrl: 'hylo.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    il: {
        name: 'IL',
        monaco: 'asm',
        extensions: ['.il'],
        alias: [],
        logoUrl: 'dotnet.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    ispc: {
        name: 'ispc',
        monaco: 'ispc',
        extensions: ['.ispc'],
        alias: [],
        logoUrl: 'ispc.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    java: {
        name: 'Java',
        monaco: 'java',
        extensions: ['.java'],
        alias: [],
        logoUrl: 'java.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    julia: {
        name: 'Julia',
        monaco: 'julia',
        extensions: ['.jl'],
        alias: [],
        logoUrl: 'julia.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    kotlin: {
        name: 'Kotlin',
        monaco: 'kotlin',
        extensions: ['.kt'],
        alias: [],
        logoUrl: 'kotlin.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    llvm: {
        name: 'LLVM IR',
        monaco: 'llvm-ir',
        extensions: ['.ll'],
        alias: [],
        logoUrl: 'llvm.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    llvm_mir: {
        name: 'LLVM MIR',
        monaco: 'llvm-ir',
        extensions: ['.mir'],
        alias: [],
        logoUrl: 'llvm.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    modula2: {
        name: 'Modula-2',
        monaco: 'modula2',
        extensions: ['.mod'],
        alias: [],
        logoUrl: null,
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    nim: {
        name: 'Nim',
        monaco: 'nim',
        extensions: ['.nim'],
        alias: [],
        logoUrl: 'nim.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    objc: {
        name: 'Objective-C',
        monaco: 'objective-c',
        extensions: ['.m'],
        alias: [],
        logoUrl: null,
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    'objc++': {
        name: 'Objective-C++',
        monaco: 'objective-c',
        extensions: ['.mm'],
        alias: [],
        logoUrl: null,
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: "'",
    },
    ocaml: {
        name: 'OCaml',
        monaco: 'ocaml',
        extensions: ['.ml', '.mli'],
        alias: [],
        logoUrl: 'ocaml.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    openclc: {
        name: 'OpenCL C',
        monaco: 'openclc',
        extensions: ['.cl', '.ocl'],
        alias: [],
        logoUrl: 'opencl.svg',
        logoUrlDark: 'opencl-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    pascal: {
        name: 'Pascal',
        monaco: 'pascal',
        extensions: ['.pas', '.dpr'],
        alias: [],
        logoUrl: 'pascal.svg', // TODO: Find a better alternative
        logoUrlDark: 'pascal-dark.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    pony: {
        name: 'Pony',
        monaco: 'pony',
        extensions: ['.pony'],
        alias: [],
        logoUrl: 'pony.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    python: {
        name: 'Python',
        monaco: 'python',
        extensions: ['.py'],
        alias: [],
        logoUrl: 'python.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    racket: {
        name: 'Racket',
        monaco: 'scheme',
        extensions: ['.rkt'],
        alias: [],
        logoUrl: 'racket.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: 'scheme',
    },
    ruby: {
        name: 'Ruby',
        monaco: 'ruby',
        extensions: ['.rb'],
        alias: [],
        logoUrl: 'ruby.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: 'asmruby',
        digitSeparator: '_',
    },
    rust: {
        name: 'Rust',
        monaco: 'rust',
        extensions: ['.rs'],
        alias: [],
        logoUrl: 'rust.svg',
        logoUrlDark: 'rust-dark.svg',
        formatter: 'rustfmt',
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    snowball: {
        name: 'Snowball',
        monaco: 'swift',
        extensions: ['.sn'],
        alias: [],
        logoUrl: 'snowball.svg',
        logoUrlDark: 'snowball.svg',
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    scala: {
        name: 'Scala',
        monaco: 'scala',
        extensions: ['.scala'],
        alias: [],
        logoUrl: 'scala.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    solidity: {
        name: 'Solidity',
        monaco: 'sol',
        extensions: ['.sol'],
        alias: [],
        logoUrl: 'solidity.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    spice: {
        name: 'Spice',
        monaco: 'spice',
        extensions: ['.spice'],
        alias: [],
        logoUrl: 'spice.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    swift: {
        name: 'Swift',
        monaco: 'swift',
        extensions: ['.swift'],
        alias: [],
        logoUrl: 'swift.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    tablegen: {
        name: 'LLVM TableGen',
        monaco: 'tablegen',
        extensions: ['.td'],
        alias: [],
        logoUrl: 'llvm.png',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    toit: {
        name: 'Toit',
        monaco: 'toit',
        extensions: ['.toit'],
        alias: [],
        logoUrl: 'toit.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    typescript: {
        name: 'TypeScript Native',
        monaco: 'typescript',
        extensions: ['.ts', '.d.ts'],
        alias: [],
        logoUrl: 'ts.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    v: {
        name: 'V',
        monaco: 'v',
        extensions: ['.v', '.vsh'],
        alias: [],
        logoUrl: 'v.svg',
        logoUrlDark: null,
        formatter: 'vfmt',
        previewFilter: null,
        monacoDisassembly: 'nc',
    },
    vala: {
        name: 'Vala',
        monaco: 'vala',
        extensions: ['.vala'],
        alias: [],
        logoUrl: 'vala.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    vb: {
        name: 'Visual Basic',
        monaco: 'vb',
        extensions: ['.vb'],
        alias: [],
        logoUrl: 'dotnet.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    wasm: {
        name: 'WASM',
        monaco: 'wat',
        extensions: ['.wat'],
        alias: [],
        logoUrl: 'wasm.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
    },
    zig: {
        name: 'Zig',
        monaco: 'zig',
        extensions: ['.zig'],
        alias: [],
        logoUrl: 'zig.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    javascript: {
        name: 'Javascript',
        monaco: 'typescript',
        extensions: ['.mjs'],
        alias: [],
        logoUrl: 'js.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: null,
        monacoDisassembly: null,
        digitSeparator: '_',
    },
    gimple: {
        name: 'GIMPLE',
        monaco: 'nc',
        extensions: ['.c'],
        alias: [],
        logoUrl: 'gimple.svg',
        logoUrlDark: null,
        formatter: null,
        previewFilter: /^\s*#include/,
        monacoDisassembly: null,
    },
};

export const languages = Object.fromEntries(
    Object.entries(definitions).map(([key, lang]) => {
        let example: string;
        try {
            example = fs.readFileSync(path.join('examples', key, 'default' + lang.extensions[0]), 'utf8');
        } catch (error) {
            example = 'Oops, something went wrong and we could not get the default code for this language.';
        }

        const def: Language = {
            ...lang,
            id: key as LanguageKey,
            supportsExecute: false,
            example,
        };
        return [key, def];
    }),
) as Record<LanguageKey, Language>;
