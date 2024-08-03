// utils/layerUtils.js
export const saveLayersToFile = (layers) => {
    localStorage.setItem('layers', JSON.stringify(layers));
};

export const loadLayersFromFile = async () => {
    try {
        const response = await fetch('assets/layermap.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.layers;
    } catch (error) {
        console.error('Error loading layers:', error);
        return [];
    }
};

export const updateLayersFromFile = (fileContent) => {
    const jsonData = JSON.parse(fileContent);
    return jsonData.layers;
};
