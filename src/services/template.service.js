import { Template } from '../models/index.js';

export const listTemplates = async () => {
  return await Template.findAll({
    where: { active: true },
    order: [['name', 'ASC']],
  });
};

export default { listTemplates };
