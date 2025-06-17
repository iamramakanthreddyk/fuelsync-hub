import Joi from 'joi';

export const createNozzleSchema = Joi.object({
  pumpId: Joi.string().uuid().required(),
  name: Joi.string().min(2).max(100).required(),
  fuelType: Joi.string().valid('diesel', 'petrol', 'other').required(),
  status: Joi.string().valid('active', 'inactive').optional()
});
