import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import querystring from 'querystring';


async function loginAndFetchData() {
    let filehosting = null;
    let spf_cookie = null;

    try {
        let loginurl = 'https://cpanel.clickcall.co.il/serverscall/admin/login.php';
        let loginResponse = await axios.get(loginurl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "he-IL,he;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6",
                "Connection": "keep-alive",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"'
            }
        });

        let setCookieHeader = loginResponse.headers['set-cookie'];

        if (setCookieHeader && setCookieHeader.length > 0) {
            filehosting = `filehosting=${setCookieHeader[0].split(';')[0].split('=')[1]}`;
        }
    } catch (error) {
        console.error('Error during login GET:', error);
    }

    try {
        let loginPostResponse = await axios.post(
            'https://cpanel.clickcall.co.il/serverscall/admin/index.php',
            querystring.stringify({
                username: '83024703',
                password: '325277697',
                submitme: '1'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Referer': 'https://cpanel.clickcall.co.il/serverscall/admin/login.php',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                    'sec-ch-ua-platform': '"macOS"',
                    'Cookie': filehosting,
                    'Accept-Language': 'he-IL,he;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'max-age=0',
                    'Origin': 'https://cpanel.clickcall.co.il',
                    'Sec-Fetch-Dest': 'document',
                    'content-length': '44',
                }
            }
        );

        let postCookies = loginPostResponse.headers['set-cookie'];
        if (postCookies && postCookies.length > 0) {
            spf_cookie = postCookies[0].split(';')[0];
        }

        // Perform the final request using the cookies
        let homePageResponse = await axios.get('https://cpanel.clickcall.co.il/serverscall/admin/home.php', {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'he-IL,he;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': `${filehosting}; ${spf_cookie}`,
                'Referer': 'https://cpanel.clickcall.co.il/serverscall/admin/login.php',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"'
            }
        });


        return { cookies: `${filehosting}; ${spf_cookie}` };
    } catch (error) {
        console.error('Error during login POST:', error);
    }
}

async function del_file(file_id) {
    let { cookies } = await loginAndFetchData();

    fetch("https://cpanel.clickcall.co.il/serverscall/admin/ajax/action.ajax.php", {
        method: "POST",
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "he-IL,he;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": cookies,
            "Origin": "https://cpanel.clickcall.co.il",
            "Referer": "https://cpanel.clickcall.co.il/serverscall/admin/server_manage-v2.php?u=sel",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "sec-ch-ua": `"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"`,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": `"macOS"`
        },
        body: `id=${file_id}&act=2`
    })
    .then(response => response.text())
    .catch(error => console.error('Error:', error));
}

async function get_all_file_ids_except_last(id_folder) {
    const { cookies } = await loginAndFetchData();

    return fetch("https://cpanel.clickcall.co.il/serverscall/admin/ajax/server_manage-v2.ajax.php", {
        headers: {
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
            "cookie": cookies,
            "Referer": "https://cpanel.clickcall.co.il/serverscall/admin/server_manage-v2.php?u=sel",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        body: `sper=&too=${id_folder}&filterText=&type=1&iDisplayStart=0&iDisplayLength=10&whatsee=0`,
        method: "POST"
    })
    .then(response => response.text())
    .then(html => {
        // חיפוש ערכים של ariaid בתוך ה-HTML        
        const ariaidPattern = /ariaid='(\d+)'/g; // מחפש ariaid במבנה 'ariaid='...'
        let match;
        let ariaidValues = [];

        while ((match = ariaidPattern.exec(html)) !== null) {
            ariaidValues.push(parseInt(match[1]));
        }

        if (ariaidValues.length > 0) {
            ariaidValues.sort((a, b) => a - b); // מיון הערכים
            ariaidValues.pop(); // מוציא את הערך הגבוה ביותר
            return ariaidValues;
        } else {
            return [];
        }
    })
    .catch(error => console.error('Error:', error));
}


export async function uploadFile(filePath, shId) {
    let token = '57ff98726cc9e044705cf604b33a072b';
    let url = `https://cpanel.clickcall.co.il/serverscall/api.php?act=new_file&token=${token}&sh_id=${shId}`;
    let fileName = path.basename(filePath);

    let formData = new FormData();
    formData.append('file_contents', fs.createReadStream(filePath), fileName);
    formData.append('name', fileName);

    try {
        let response = await axios.post(url, formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        fs.unlinkSync(filePath); 
        let file_ids_to_delete = await get_all_file_ids_except_last(shId);
        file_ids_to_delete.forEach(file_id => {
            del_file(file_id); // מחיקת כל הקבצים שחוזרים
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    }
}