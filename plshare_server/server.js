const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const YOUTUBE_API_KEY = "API키" 

const app = express()

const USERDATA_PATH = path.resolve(__dirname, 'userdata.json')
const PLAYLISTDATA_PATH = path.resolve(__dirname, 'playlistData.json')

const loadData = (filePath, defaultData) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8')) 
    } catch {
        return defaultData
    }
}

const saveData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8') 
}

let userdata = loadData(USERDATA_PATH, [{ id: 'test', pw: 'test', name: 'test', age: '23' }])
let playlistData = loadData(PLAYLISTDATA_PATH, [])

app.use(express.json())
app.use(cors())

app.listen(8080, () => console.log("8080"))

//API-아이디체크
app.get('/idcheck/:id', (req, res) => res.send({ ok: !userdata.some(user => user.id === req.params.id) }))


//API-회원가입
app.get('/signup/:id/:pw/:name/:age', (req, res) => {
    const { id, pw, name, age } = req.params
    if (userdata.some(user => user.id === id) || !(id && pw && name && age)) return res.send({ ok: false })
    userdata.push({ id, pw, name, age })
    saveData(USERDATA_PATH, userdata)
    res.send({ ok: true })
})


//API-로그인
app.get('/login/:id/:pw', (req, res) => {
    const user = userdata.find(user => user.id === req.params.id && user.pw === req.params.pw)
    res.send(user ? { ok: true, user } : { ok: false })
})

//API-비밀번호변경(구현하지 않음)
app.get('/changepw/:id/:pw', (req, res) => {
    const user = userdata.find(user => user.id === req.params.id)
    if (user) {
        user.pw = req.params.pw
        saveData(USERDATA_PATH, userdata)
    }
    res.send({ ok: !!user })
})

//API-플레이리스트 데이터를 전송
app.get('/playlistData', (_, res) => res.send(playlistData))

//API-플레이리스트 삭제
app.delete('/rmplaylist/:playlistId', (req, res) => {
    const index = playlistData.findIndex(playlist => playlist.playlistId === req.params.playlistId)
    if (index !== -1) {
        playlistData.splice(index, 1)
        saveData(PLAYLISTDATA_PATH, playlistData)
        return res.send({ ok: true })
    }
    res.status(404).send({ ok: false, message: "재생목록을 찾을 수 없습니다." })
})

//API-플레이리스트 업로드
app.post('/shareplaylist', async (req, res) => {
    const { url, tag, uploader } = req.body
    if (!url || !url.includes("youtube.com/playlist")) return res.status(400).send({ ok: false, message: "유효한 YouTube 재생목록 URL이 아닙니다." })

    const playlistId = new URLSearchParams(new URL(url).search).get('list')
    if (!playlistId || playlistData.some(playlist => playlist.playlistId === playlistId)) return res.status(400).send({ ok: false, message: "유효하지 않거나 이미 존재하는 재생목록입니다." })

    try {
        const [playlistRes, itemsRes] = await Promise.all([
            axios.get('https://www.googleapis.com/youtube/v3/playlists', {
                params: { part: 'snippet', id: playlistId, key: YOUTUBE_API_KEY }
            }),
            axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                params: { part: 'snippet', playlistId, key: YOUTUBE_API_KEY, maxResults: 100 }
            })
        ])

        const title = playlistRes.data.items[0]?.snippet?.title || "제목 없음"
        const items = itemsRes.data.items?.map(item => ({
            videoId: item.snippet.resourceId?.videoId || "알 수 없음",
            title: item.snippet.title || "제목 없음",
            description: item.snippet.description || "설명 없음",
            thumbnail: item.snippet.thumbnails?.high?.url || "https://via.placeholder.com/480x360.png?text=섬네일 없음"
        })) || []

        playlistData.push({ playlistId, title, uploader, tag, items })
        saveData(PLAYLISTDATA_PATH, playlistData)
        res.send({ ok: true, data: { title, items } })
    } catch (error) {
        res.status(500).send({ ok: false, message: "YouTube 데이터를 가져오는 데 실패했습니다." })
    }
})
