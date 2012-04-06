

exports.all_tags = {
    map : function(doc) {
        if (doc.type && doc.type === 'garden.tag' ) {
            emit(doc.hash, null);
        }
    }
}

