import cheerio from 'cheerio';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

function del_file(file_id) {
    fetch("https://cpanel.clickcall.co.il/serverscall/admin/ajax/action.ajax.php", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "he-IL,he;q=0.9,en;q=0.8",
            "connection": "keep-alive",
            "content-length": "17",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "cookie": "spf=%7B%22un%22%3A%2283024703%22%2C%22pw%22%3A%22d94ffec903e10bbcb14d702416437205%22%7D; filehosting=tqufm9aongj7j3dla4l41nak14",
            "host": "cpanel.clickcall.co.il",
            "origin": "origin",
            "Referer": "https://cpanel.clickcall.co.il/serverscall/admin/server_manage-v2.php?u=sel",
            "cache-control": "no-cache",
            "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
            "pragma": "no-cache",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            "x-requested-with": "XMLHttpRequest",
            // "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `id=${file_id}&act=2`,
        "method": "POST"
    }).then(response => response.json())
        // .then(data => console.log({ 'data result delete': data }))
        .catch(error => console.error('Error:', error));
}

function get_last_file_id(id_folder) {
    return fetch("https://cpanel.clickcall.co.il/serverscall/admin/ajax/server_manage-v2.ajax.php", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "he-IL,he;q=0.9,en-CA;q=0.8,en-US;q=0.7,en;q=0.6",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "spf=%7B%22un%22%3A%2283024703%22%2C%22pw%22%3A%22d94ffec903e10bbcb14d702416437205%22%7D; filehosting=tqufm9aongj7j3dla4l41nak14",
            "Referer": "https://cpanel.clickcall.co.il/serverscall/admin/server_manage-v2.php?u=sel",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `sper=&too=${id_folder}&filterText=&type=1&iDisplayStart=0&iDisplayLength=10&whatsee=0`,
        "method": "POST"
    })
        .then(response => response.text())
        .then(html => {
            const $ = cheerio.load(html);
            let ariaidValues = $('[ariaid]').map((i, el) => $(el).attr('ariaid')).get();
            ariaidValues = ariaidValues.reverse();
            if (ariaidValues.length === 1) {
                return undefined;
            }
            return ariaidValues[0];
        })
    // .catch(error => console.error('Error:', error));
}



export async function uploadFile(filePath, shId) {
    let token = '57ff98726cc9e044705cf604b33a072b';
    const url = `https://cpanel.clickcall.co.il/serverscall/api.php?act=new_file&token=${token}&sh_id=${shId}`;
    const fileName = path.basename(filePath);

    const formData = new FormData();
    formData.append('file_contents', fs.createReadStream(filePath), fileName);
    formData.append('name', fileName);
    try {
        const response = await axios.post(url, formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        // console.log(`File ${fileName} uploaded successfully.`);
        fs.unlinkSync(filePath);
        const last_file_id = await get_last_file_id(shId);
        // console.log({ 'last file': last_file_id });
        if (last_file_id) {
            del_file(last_file_id);
        }
        return response.data;
    } catch (error) {
        // console.error('Error uploading file:', error);
        return null;
    }
}
