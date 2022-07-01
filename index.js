const { default: axios } = require('axios');
const express = require('express');
const NodeCache = require( "node-cache" );
const MovieDB = require('node-themoviedb');

const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 3000
const tmdbApiKey = process.env.TMDB_API_KEY

const app = express();
const cache = new NodeCache();
const mdb = new MovieDB(tmdbApiKey, { language: 'zh-CN' });

app.get('/v1/tvdb/shows/en/:tvdbId', async (req, res) => {
  const { tvdbId } = req.params

  const cached = cache.get(tvdbId)
  if (cached) return res.send(cached)

  const { data } = await axios.get(`http://skyhook.sonarr.tv/v1/tvdb/shows/en/${tvdbId}`)
  try {
    const result = await mdb.find.byExternalID({
      query: {
        external_source: 'tvdb_id',
      },
      pathParameters: {
        external_id: data.tvdbId,
      }
    })
    const tv_result = result.data?.tv_results[0]
    if (tv_result) {
      data.alternativeTitles.unshift({
        title: tv_result.original_name,
      })
      data.alternativeTitles.unshift({
        title: tv_result.name,
      })
    }
  } catch (error) {}

  cache.set(tvdbId, data, 60 * 15)

  return res.send(data)
})

app.get('/v1/tvdb/search/en', async (req, res) => {
  const { term } = req.query

  const { data } = await axios.get(`http://skyhook.sonarr.tv/v1/tvdb/search/en/`, {
    params: {
      term,
    }
  })
  return res.send(data)
})

app.listen(port, host, () => {
  console.log(`App listening on port ${host}:${port}`)
})