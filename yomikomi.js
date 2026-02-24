(function() {
    const btn = document.createElement("button");
    btn.textContent = "【V5】ワールドデータを読み込む";
    btn.style.cssText = "position:fixed;top:10px;left:10px;z-index:9999;padding:15px;background:#2ecc71;color:white;font-size:16px;border:none;border-radius:5px;cursor:pointer;";
    document.body.appendChild(btn);

    function base64ToBytes(base64) {
        let binary_string = atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    // 変換されたデータを奥深くまで探し、元のバイナリに復元する関数
    function decodeData(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj.__isBuffer) {
            let bytes = base64ToBytes(obj.base64);
            return obj.type === 'ArrayBuffer' ? bytes.buffer : bytes;
        }
        if (Array.isArray(obj)) return obj.map(decodeData);
        const res = {};
        for (let k in obj) res[k] = decodeData(obj[k]);
        return res;
    }

    btn.onclick = async () => {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{ description: 'JSON File', accept: {'application/json': ['.json']} }],
            });
            
            btn.textContent = "読み込み中...（画面を閉じないでください）";
            const file = await fileHandle.getFile();
            const text = await file.text();
            const importData = JSON.parse(text);

            const dbName = "_net_lax1dude_eaglercraft_v1_8_internal_PlatformFilesystem_1_12_2_";
            const db = await new Promise((res, rej) => {
                const req = indexedDB.open(dbName);
                req.onsuccess = e => res(e.target.result);
                req.onerror = e => rej(e);
            });

            for (const storeName in importData) {
                if (!db.objectStoreNames.contains(storeName)) continue; 
                
                const transaction = db.transaction(storeName, "readwrite");
                const store = transaction.objectStore(storeName);
                
                for (const item of importData[storeName]) {
                    if (item.key !== undefined && item.value !== undefined) {
                        try {
                            const val = decodeData(item.value);
                            if (store.keyPath !== null) {
                                store.put(val);
                            } else {
                                store.put(val, item.key);
                            }
                        } catch(e) {
                            console.error(`保存領域 [${storeName}] でエラー:`, e);
                        }
                    }
                }
                
                await new Promise(res => {
                    transaction.oncomplete = res;
                });
            }
            
            alert("ワールドデータの復元が完了しました！ページを再読み込みします。");
            btn.remove();
            location.reload();
            
        } catch (err) {
            console.error(err);
            if (err.name !== 'AbortError') alert("エラーが発生しました: " + err.message);
            btn.textContent = "【V5】ワールドデータを読み込む";
        }
    };
})();
