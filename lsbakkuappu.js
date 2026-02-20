//書き出し
const data = {};
Object.keys(localStorage).forEach(key => {
  if (key.includes("eaglercraft")) {
        data[key] = localStorage.getItem(key);
    }
});
console.log(JSON.stringify(data));

ーーー
// 読み込み
const data = ここにデータ ;
Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
alert("設定の復元が完了しました！");
location.reload();
