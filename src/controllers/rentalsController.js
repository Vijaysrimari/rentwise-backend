import Rental from '../models/Rental.js'

export const listRentals = async (request, response) => {
  const userId = request.query.tenant || request.query.manager || request.query.userId
  const filter = userId ? { userId } : {}
  const rentals = await Rental.find(filter).sort({ createdAt: -1 })
  response.json(rentals)
}

export const createRental = async (request, response) => {
  const rental = await Rental.create(request.body)
  response.status(201).json(rental)
}
