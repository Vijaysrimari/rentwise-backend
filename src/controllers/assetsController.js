import Asset from '../models/Asset.js'

export const listAssets = async (request, response) => {
  const userId = request.query.owner || request.query.userId
  const filter = userId ? { userId } : {}
  const assets = await Asset.find(filter).sort({ createdAt: -1 })
  response.json(assets)
}

export const createAsset = async (request, response) => {
  const asset = await Asset.create(request.body)
  response.status(201).json(asset)
}

export const deleteAsset = async (request, response) => {
  await Asset.findByIdAndDelete(request.params.id)
  response.status(204).send()
}
