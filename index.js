/**
 * @module WebpackTeamcityBundleSizePlugin
 */
const path = require("path");

const defaultLogger = ({ omitQuery = false, prefix = '' } = {}) => ({
    done: stats => {
        // Only run this if on Team City
        if (process.env && !process.env.TEAMCITY_VERSION) {
            return;
        }
        const { assetsByChunkName, assets } = stats.toJson();

        assets.forEach(asset => {
            const chunkName = asset.chunkNames[0];
            if (!assetsByChunkName[chunkName]) {
                return;
            }

            const { name: assetName, size: assetSize } = asset;
            let assetKey = path.basename(assetName);
            if (omitQuery) {
                assetKey = assetKey.split('?')[0]
            }
            if (prefix) {
                assetKey = `${prefix}${assetKey}`
            }

            console.log(`##teamcity[buildStatisticValue key='${assetKey}' value='${assetSize}']`);
        });
    }
});

class WebpackTeamcityBundleSizePlugin {
    constructor(options) {
        this.callback = Object.assign({}, defaultLogger(options), options.callback || {});
    }
    apply(compiler) {
        Object.keys(this.callback).forEach(key => {
            compiler.plugin(key, this.callback[key]);
        });
    }
}

module.exports = WebpackTeamcityBundleSizePlugin;
