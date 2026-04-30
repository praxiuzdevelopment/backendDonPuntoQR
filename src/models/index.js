import sequelize from '../config/database.js';

// ─── Sprint 1 ─────────────────────────────────────────────
import initTenant  from './Tenant.js';
import initRole    from './Role.js';
import initCity    from './City.js';
import initLicense from './License.js';
import initUser    from './User.js';

// ─── Sprint 2 ─────────────────────────────────────────────
import initAuditLog from './AuditLog.js';
import initBranch   from './Branch.js';
import initCategory from './Category.js';
import initProduct  from './Product.js';

// ─── Sprint 3 ─────────────────────────────────────────────
import initSchedule     from './Schedule.js';
import initTemplate     from './Template.js';
import initMenu         from './Menu.js';
import initMenuCategory from './MenuCategory.js';
import initMenuProduct  from './MenuProduct.js';

// ─── Sprint 4 ─────────────────────────────────────────────
import initQRCode from './QRCode.js';

const Tenant  = initTenant(sequelize);
const Role    = initRole(sequelize);
const City    = initCity(sequelize);
const License = initLicense(sequelize);
const User    = initUser(sequelize);

const AuditLog = initAuditLog(sequelize);
const Branch   = initBranch(sequelize);
const Category = initCategory(sequelize);
const Product  = initProduct(sequelize);

const Schedule     = initSchedule(sequelize);
const Template     = initTemplate(sequelize);
const Menu         = initMenu(sequelize);
const MenuCategory = initMenuCategory(sequelize);
const MenuProduct  = initMenuProduct(sequelize);
const QRCode       = initQRCode(sequelize);

const models = {
  Tenant,
  Role,
  City,
  License,
  User,
  AuditLog,
  Branch,
  Category,
  Product,
  Schedule,
  Template,
  Menu,
  MenuCategory,
  MenuProduct,
  QRCode,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { 
  sequelize, 
  Tenant, Role, City, License, User, 
  AuditLog, Branch, Category, Product,
  Schedule, Template, Menu, MenuCategory, MenuProduct, QRCode
};
export default models;
