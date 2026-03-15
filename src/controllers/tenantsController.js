import Tenant from '../models/Tenant.js'

export const listTenants = async (_request, response) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 })
  response.json(tenants)
}

export const createTenant = async (request, response) => {
  const tenant = await Tenant.create(request.body)
  response.status(201).json(tenant)
}
