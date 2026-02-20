(function() {
    const btn = document.createElement("button");
    btn.textContent = "【V3】ワールドデータを読み込む";
    btn.style.cssText = "position:fixed;top:10px;left:10px;z-index:9999;padding:15px;background:#2ecc71;color:white;font-size:16px;border:none;border-radius:5px;cursor:pointer;";
    document.body.appendChild(btn);

    // 文字(Base64)を元のバイナリデータに戻す関数
    function base64ToBuffer(base64) {
        let binary_string = atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
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
                            let val = item.value;
                            // 文字に変換されていたデータをバイナリに戻す
                            if (val && val.data && val.data.__isBuffer) {
                                val.data = base64ToBuffer(val.data.base64);
                            }

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
            btn.textContent = "【V3】ワールドデータを読み込む";
        }
    };
})();
