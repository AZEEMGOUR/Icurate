// FileHandler.js
import { useState } from 'react';

export const useFileHandler = () => {
    const [layers, setLayers] = useState([]);

    const onFileChange = (event) => {
        const input = event.target;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const fileContent = reader.result;
                const jsonData = JSON.parse(fileContent);
                if (jsonData.layers && Array.isArray(jsonData.layers)) {
                    setLayers(jsonData.layers);
                } else {
                    console.error("Invalid file format");
                }
            };

            reader.readAsText(file);
        }
    };

    return {
        layers,
        onFileChange
    };
};
