(async function() {
    function bufferToBase64(buf) {
        let binary = '';
        let bytes = new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function encodeData(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof ArrayBuffer) return { __isBuffer: true, type: 'ArrayBuffer', base64: bufferToBase64(obj) };
        if (obj instanceof Uint8Array) return { __isBuffer: true, type: 'Uint8Array', base64: bufferToBase64(obj) };
        if (Array.isArray(obj)) return obj.map(encodeData);
        const res = {};
        for (let k in obj) res[k] = encodeData(obj[k]);
        return res;
    }

    try {
        console.log("エクスポート処理を開始しています...");
        const dbName = "_net_lax1dude_eaglercraft_v1_8_internal_PlatformFilesystem_1_12_2_";
        const db = await new Promise((res, rej) => {
            const req = indexedDB.open(dbName);
            req.onsuccess = e => res(e.target.result);
            req.onerror = e => rej(e);
        });
        
        const exportData = {};
        for (const storeName of db.objectStoreNames) {
            exportData[storeName] = await new Promise(res => {
                const items = [];
                const req = db.transaction(storeName, "readonly").objectStore(storeName).openCursor();
                req.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        items.push({ key: cursor.key, value: encodeData(cursor.value) });
                        cursor.continue();
                    } else {
                        res(items);
                    }
                };
            });
        }
        
        const jsonStr = JSON.stringify(exportData);
        const handle = await window.showSaveFilePicker({
            suggestedName: 'eaglercraft_worlds_backup_V5.json',
            types: [{ description: 'JSON File', accept: {'application/json': ['.json']} }],
        });
        
        const writable = await handle.createWritable();
        await writable.write(jsonStr);
        await writable.close();
        
        console.log("保存が完了しました。");
    } catch (err) {
        if (err.name !== 'AbortError') console.error("エラーが発生しました:", err);
    }
})();
