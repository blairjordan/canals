const transloaditCallback = (pool) => async (req, res) => {
  try {
    const client = await pool.connect()

    const transloadit = JSON.parse(req.body.transloadit)

    if (transloadit.ok !== "ASSEMBLY_COMPLETED") {
      throw new Error("Transloadit assembly not completed")
    }

    const { playerId } = transloadit.fields
    const { resize_image: resizedImages } = transloadit.results

    if (!(resizedImages && resizedImages.length !== 0)) {
      throw new Error("No resized images")
    }

    const flagUrl = resizedImages.pop().ssl_url

    const sql = "SELECT update_player_flag($1::INTEGER, $2::TEXT)"
    client.query(sql, [playerId, flagUrl])

    console.info(`🚩 Updated flag for player ${playerId} to ${flagUrl}`)

    client.release()

    res.status(200).send({ status: "ok" })
  } catch (error) {
    console.error(error)
    res.status(200).send()
  }
}

module.exports = { transloaditCallback }
