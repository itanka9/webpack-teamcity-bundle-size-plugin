/**
 * @module WebpackTeamcityBundleSizePlugin
 */
const path = require("path");

const defaultLogger = ({ omitQuery = false, prefix = '' } = {}) => ({
    done: stats => {
        // Only run this if on Team City
        if (process.env && Object.keys(process.env).filter(k => k.indexOf('TEAMCITY') !== -1).length === 0) {
            return;
        }
        const { assetsByChunkName, assets } = stats.toJson(),
            totals = {};

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
            const assetExt = path.extname(assetKey) || ''
            if (!totals[assetExt]) {
                totals[assetExt] = 0
            }
            totals[assetExt] += assetSize

            console.log(`##teamcity[buildStatisticValue key='${assetKey}' value='${assetSize}']`);
            Object.entries(totals).forEach(([ assetExt, totalSize ]) => {
                console.log(`##teamcity[buildStatisticValue key='${prefix}total-${assetExt}' value='${totalSize}']`);
            })
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
