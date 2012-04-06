/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/_couch', to: '../../../'},
    {from: '/_couch/', to: '../../../'},
    {from: '/_couch/*', to: '../../../*'},
    {from: '/_config', to : '../../../_config'},
    {from: '/_config/*', to : '../../../_config/*'},
    {from: '/static/*', to: 'static/*'},
    {from: '/bootstrap/*', to: 'bootstrap/*'},
    {from: '/modules.js', to: 'modules.js' },
    {"from": "/_db/*", "to": "../../*" },
    {"from": "/_db", "to": "../.." },
    {from: '/', to: 'index.html'},
];