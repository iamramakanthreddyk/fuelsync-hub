import Joi from 'joi';

export const createPumpSchema = Joi.object({
  stationId: Joi.string().uuid().required(),
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('diesel', 'petrol', 'other').required(),
  status: Joi.string().valid('active', 'inactive').optional()
});
