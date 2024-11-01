// In directoryManager.js

export const handleDirectorySelect = async (setDirectoryHandle, setSavedDesigns) => {
    try {
        const directory = await window.showDirectoryPicker();
        console.log("Selected Directory:", directory.name);
        setDirectoryHandle(directory);

        // Optionally save the directory info to local storage
        await saveDirectoryInfo(directory);

        const files = [];
        for await (const entry of directory.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                files.push(entry.name);
            }
        }
        setSavedDesigns(files);
    } catch (error) {
        console.error('Error selecting directory:', error);
    }
};

export const saveDirectoryInfo = async (directory) => {
    try {
        const files = [];
        for await (const entry of directory.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                files.push(entry.name);
            }
        }
        localStorage.setItem('selectedDirectory', JSON.stringify({
            directoryName: directory.name,
            files: files
        }));
    } catch (error) {
        console.error('Error saving directory info to localStorage:', error);
    }
};

export const loadDirectoryInfo = () => {
    try {
        const directoryInfo = localStorage.getItem('selectedDirectory');
        if (directoryInfo) {
            return JSON.parse(directoryInfo);
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};
