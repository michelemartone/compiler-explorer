import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        defaultToken: 'invalid',

        keywords: [
            'assert',
            'asm',
            'bitstruct',
            'break',
            'case',
            'catch',
            'const',
            'continue',
            'define',
            'default',
            'defer',
            'do',
            'else',
            'enum',
            'extern',
            'false',
            'fault',
            'for',
            'foreach',
            'foreach_r',
            'fn',
            'tlocal',
            'if',
            'import',
            'macro',
            'module',
            'nextcase',
            'null',
            'private',
            'return',
            'static',
            'struct',
            'switch',
            'true',
            'try',
            'union',
            'var',
            'while',
            'def',
            'distinct',
            'inline',
            '$alignof',
            '$append',
            '$assert',
            '$case',
            '$concat',
            '$default',
            '$defined',
            '$echo',
            '$else',
            '$embed',
            '$endfor',
            '$endforeach',
            '$endif',
            '$endswitch',
            '$eval',
            '$evaltype',
            '$extnameof',
            '$for',
            '$foreach',
            '$if',
            '$include',
            '$nameof',
            '$offsetof',
            '$qnameof',
            '$sizeof',
            '$stringify',
            '$switch',
            '$vacount',
            '$vaconst',
            '$varef',
            '$vaarg',
            '$vaexpr',
            '$vasplat',
            '$$abs',
            '$$bitreverse',
            '$$bswap',
            '$$ceil',
            '$$compare_exchange',
            '$$copysign',
            '$$cos',
            '$$clz',
            '$$ctz',
            '$$add',
            '$$div',
            '$$mod',
            '$$mul',
            '$$neg',
            '$$sub',
            '$$exp',
            '$$exp2',
            '$$expect',
            '$$expect_with_probability',
            '$$floor',
            '$$fma',
            '$$fmuladd',
            '$$frameaddress',
            '$$fshl',
            '$$fshr',
            '$$get_rounding_mode',
            '$$log',
            '$$log10',
            '$$log2',
            '$$max',
            '$$memcpy',
            '$$memcpy_inline',
            '$$memmove',
            '$$memset',
            '$$memset_inline',
            '$$min',
            '$$nearbyint',
            '$$overflow_add',
            '$$overflow_mul',
            '$$overflow_sub',
            '$$popcount',
            '$$pow',
            '$$pow_int',
            '$$prefetch',
            '$$reduce_add',
            '$$reduce_and',
            '$$reduce_fadd',
            '$$reduce_fmul',
            '$$reduce_max',
            '$$reduce_min',
            '$$reduce_mul',
            '$$reduce_or',
            '$$reduce_xor',
            '$$reverse',
            '$$rint',
            '$$round',
            '$$roundeven',
            '$$sat_add',
            '$$sat_shl',
            '$$sat_sub',
            '$$set_rounding_mode',
            '$$swizzle',
            '$$swizzle2',
            '$$sin',
            '$$sqrt',
            '$$stacktrace',
            '$$syscall',
            '$$sysclock',
            '$$trap',
            '$$trunc',
            '$$unreachable',
            '$$veccomplt',
            '$$veccomple',
            '$$veccompgt',
            '$$veccompge',
            '$$veccompeq',
            '$$veccompne',
            '$$volatile_load',
            '$$volatile_store',
            '$$wasm_memory_size',
            '$$wasm_memory_grow',
            '$$DATE',
            '$$FILE',
            '$$FILEPATH',
            '$$FUNC',
            '$$FUNCTION',
            '$$LINE',
            '$$LINE_RAW',
            '$$MODULE',
            '$$TEST_NAMES',
            '$$TEST_FNS',
            '$$TIME',
        ],
        typeKeywords: [
            'anyfault',
            'any',
            'void',
            'bool',
            'char',
            'double',
            'float16',
            'bfloat16',
            'float128',
            'int128',
            'int',
            'ichar',
            'iptr',
            'isz',
            'long',
            'short',
            'uint128',
            'uint',
            'ulong',
            'uptr',
            'ushort',
            'usz',
            'float',
            'typeid',
            'ireg',
            'ureg',
            '$vatype',
            '$typeof',
            '$typefrom',
        ],
        operators: [
            '+',
            '-',
            '/',
            '*',
            '=',
            '^',
            '&',
            '?',
            '|',
            '!',
            '>',
            '<',
            '%',
            '??',
            '!!',
            '++',
            '--',
            '<<',
            '>>',
            '+=',
            '-=',
            '/=',
            '*=',
            '==',
            '!=',
            '^=',
            '&=',
            '|=',
            '>=',
            '<=',
            '%=',
            '<<=',
            '>>=',
            '+++',
            '&&&',
            '|||',
        ],

        symbols: /[=><!~?:&|+\-*/^%]+/,

        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        tokenizer: {
            root: [
                // u0/i0 integer types
                [/[iu]\d+/, 'keyword'],

                // identifiers and keywords
                [
                    /[a-z_$][\w$]*/,
                    {
                        cases: {
                            '@typeKeywords': 'keyword',
                            '@keywords': 'keyword',
                            '@default': 'identifier',
                        },
                    },
                ],

                [/@[a-zA-Z_$]*/, 'builtin.identifier'],

                [/[A-Z][\w$]*/, 'type.identifier'], // to show class names nicely

                // whitespace
                {include: '@whitespace'},

                // delimiters and operators
                [/[{}()[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [
                    /@symbols/,
                    {
                        cases: {
                            '@operators': 'operator',
                            '@default': '',
                        },
                    },
                ],

                // numbers
                [/\d*\.\d+([eE][-+]?\d+)?[fFdD]?/, 'number.float'],
                [/0[xX][0-9a-fA-F_]*[0-9a-fA-F][Ll]?/, 'number.hex'],
                [/0o[0-7_]*[0-7][Ll]?/, 'number.octal'],
                [/0[bB][0-1_]*[0-1][Ll]?/, 'number.binary'],
                [/\d+/, 'number'],

                // delimiter: after number because of .\d floats
                [/[;,.]/, 'delimiter'],

                // strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
                [/c?\\\\.*$/, 'string'],
                [/c?"/, 'string', '@string'],

                // characters
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                [/'/, 'string.invalid'],
            ],

            whitespace: [
                [/[ \r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\+/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
                [/\t/, 'comment.invalid'],
            ],

            comment: [
                [/[^/*]+/, 'comment'],
                [/\/\*/, 'comment', '@comment'],
                [/\*\//, 'comment', '@pop'],
                [/[/*]/, 'comment'],
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop'],
            ],
        },
    };
}

monaco.languages.register({id: 'c3'});
monaco.languages.setMonarchTokensProvider('c3', definition());
