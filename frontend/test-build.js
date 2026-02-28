import { build } from 'vite';

async function run() {
    try {
        console.log('--- VITE BUILD START ---');
        await build({
            root: process.cwd(),
            logLevel: 'error',
            build: {
                minify: false,
                sourcemap: true,
                rollupOptions: {
                    onwarn(warning, warn) {
                        console.error('Rollup warning:', warning);
                        warn(warning);
                    }
                }
            }
        });
        console.log('--- VITE BUILD SUCCESS ---');
    } catch (err) {
        console.error('--- VITE BUILD ERROR ---');
        console.error(err);
        process.exit(1);
    }
}

run();
