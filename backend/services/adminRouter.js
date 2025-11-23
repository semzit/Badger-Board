const express = require('express')
const { pool } = require('../db.js')
const cors = require('cors')
const adminRouter = express.Router()

adminRouter.use(cors())
adminRouter.use(express.json())

/**
 * Add a new building to the database
 * POST /admin/building
 * 
 * req.body = {
 *   name: string,
 *   vertices: [
 *     { latitude: number, longitude: number },
 *     { latitude: number, longitude: number },
 *     { latitude: number, longitude: number },
 *     { latitude: number, longitude: number }
 *   ]
 * }
 */
adminRouter.post('/building', async (req, res) => {
  const { name, vertices } = req.body

  // Validate input
  if (!name || !vertices || vertices.length !== 4) {
    return res.status(400).json({
      success: false,
      message: 'Building name and 4 vertices are required'
    })
  }

  // Validate each vertex
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i]
    if (!v.latitude || !v.longitude) {
      return res.status(400).json({
        success: false,
        message: `Vertex ${i + 1} is missing latitude or longitude`
      })
    }
  }

  try {
    // Create a polygon from the 4 vertices
    // PostGIS ST_MakePolygon requires a closed ring (first point = last point)
    const pointsString = vertices
      .map(v => `${v.longitude} ${v.latitude}`)
      .concat(`${vertices[0].longitude} ${vertices[0].latitude}`) // Close the polygon
      .join(', ')

    // Insert building with polygon boundary
    const insertBuildingQuery = `
      INSERT INTO buildings (name, boundary)
      VALUES (
        $1,
        ST_GeogFromText('POLYGON((${pointsString}))')
      )
      RETURNING id, name;
    `

    const buildingResult = await pool.query(insertBuildingQuery, [name])
    const buildingId = buildingResult.rows[0].id

    // Create initial empty canvas (100x100 white pixels)
    // This creates a 3-band raster (RGB) initialized to white (255, 255, 255)
    const initCanvasQuery = `
      INSERT INTO building_content (building_id, content_data)
      VALUES (
        $1,
        ST_AddBand(
          ST_AddBand(
            ST_AddBand(
              ST_MakeEmptyRaster(100, 100, 0, 0, 1, 1, 0, 0, 4326),
              1, '8BUI', 255, 0
            ),
            2, '8BUI', 255, 0
          ),
          3, '8BUI', 255, 0
        )
      );
    `

    await pool.query(initCanvasQuery, [buildingId])

    res.json({
      success: true,
      message: 'Building added successfully',
      building: buildingResult.rows[0]
    })

  } catch (error) {
    console.error('Error adding building:', error)
    res.status(500).json({
      success: false,
      message: 'Database error: ' + error.message
    })
  }
})

/**
 * Get all buildings
 * GET /admin/buildings
 */
adminRouter.get('/buildings', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        name,
        ST_AsGeoJSON(boundary) as boundary,
        created_at
      FROM buildings
      ORDER BY created_at DESC;
    `

    const result = await pool.query(query)

    res.json({
      success: true,
      buildings: result.rows
    })

  } catch (error) {
    console.error('Error fetching buildings:', error)
    res.status(500).json({
      success: false,
      message: 'Database error: ' + error.message
    })
  }
})

/**
 * Delete a building
 * DELETE /admin/building/:id
 */
adminRouter.delete('/building/:id', async (req, res) => {
  const buildingId = req.params.id

  try {
    // Delete building content first (foreign key constraint)
    await pool.query('DELETE FROM building_content WHERE building_id = $1', [buildingId])
    
    // Delete the building
    const result = await pool.query('DELETE FROM buildings WHERE id = $1 RETURNING name', [buildingId])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      })
    }

    res.json({
      success: true,
      message: `Building "${result.rows[0].name}" deleted successfully`
    })

  } catch (error) {
    console.error('Error deleting building:', error)
    res.status(500).json({
      success: false,
      message: 'Database error: ' + error.message
    })
  }
})

module.exports = adminRouter