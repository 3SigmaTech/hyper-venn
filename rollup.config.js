import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'index.js',
    output: {
        file: 'build/hyper-venn.js',
        format: 'umd',
        name: 'hyperVenn'
    },
    plugins: [
        resolve({
            jsnext: true,
            //only: ['fmin'],
            main: true
        }),
        commonjs()
    ]
};