export const getLayerAndDatatypeNames = (layerNumber, datatypeNumber, layers) => {
    if (!Array.isArray(layers)) {
        return {
            layerName: 'Unknown Layer',
            datatypeName: 'Unknown Datatype',
        };
    }

    const layer = layers.find(l => l.layer_number === layerNumber && l.datatype_number === datatypeNumber);
    if (layer) {
        return {
            layerName: layer.layer_name || 'Unknown Layer',
            datatypeName: layer.datatype_name || 'Unknown Datatype',
        };
    } else {
        return {
            layerName: 'Unknown Layer',
            datatypeName: 'Unknown Datatype',
        };
    }
};
