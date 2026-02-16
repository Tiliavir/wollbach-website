'use strict';

import glob from "glob-all";
import vnuJar from 'vnu-jar';

await glob([
        'public/**/*.html',
        '!public/google*.html',
        'public/**/*.css',
        '!public/amp/**'],
    async (err, files) => {
        await vnuJar.vnu.check([
            "--also-check-svg",
            "--also-check-css",
            "--filterpattern",
            ".*view-transition.*|.*CSS: Parse Error.*",
            ...files
        ], {});
    }
);
