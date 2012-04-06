
exports.tags_only = function(doc, req) {
    if (doc.type && doc.type ==='garden.tag') return true;
    return false;
}