(function() {
    const btn = document.createElement("button");
    btn.textContent = "【V3】ワールドデータを保存";
    btn.style.cssText = "position:fixed;top:10px;left:10px;z-index:9999;padding:15px;background:#e74c3c;color:white;font-size:16px;border:none;border-radius:5px;cursor:pointer;";
    document.body.appendChild(btn);

    // バイナリデータを文字(Base64)に変換する関数
    function bufferToBase64(buf) {
        let binary = '';
        let bytes = new Uint8Array(buf);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    btn.onclick = async () => {
        try {
            btn.textContent = "データ変換中...（少し時間がかかります）";
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
                            let val = cursor.value;
                            // データがバイナリの場合、文字(Base64)に変換して保存
                            if (val && val.data && (val.data instanceof Uint8Array || val.data instanceof ArrayBuffer)) {
                                val = Object.assign({}, val); 
                                val.data = {
                                    __isBuffer: true,
                                    base64: bufferToBase64(val.data)
                                };
                            }
                            items.push({ key: cursor.key, value: val });
                            cursor.continue();
                        } else {
                            res(items);
                        }
                    };
                });
            }
            
            const jsonStr = JSON.stringify(exportData);
            btn.textContent = "保存先を選択してください";

            const handle = await window.showSaveFilePicker({
                suggestedName: 'eaglercraft_worlds_backup_V3.json',
                types: [{ description: 'JSON File', accept: {'application/json': ['.json']} }],
            });
            
            const writable = await handle.createWritable();
            await writable.write(jsonStr);
            await writable.close();
            
            alert("保存が完了しました！");
            btn.remove();
        } catch (err) {
            console.error(err);
            if (err.name !== 'AbortError') alert("エラーが発生しました: " + err.message);
            btn.textContent = "【V3】ワールドデータを保存";
        }
    };
})();
