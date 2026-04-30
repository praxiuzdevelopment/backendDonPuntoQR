import { DataTypes } from 'sequelize';

export default function defineQRCode(sequelize) {
  const QRCode = sequelize.define(
    'QRCode',
    {
      qr_code_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      menu_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      qr_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'general',
      },
      table_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#000000',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'qr_code',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  QRCode.associate = (models) => {
    QRCode.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    if (models.Menu) QRCode.belongsTo(models.Menu, { foreignKey: 'menu_id', as: 'menu' });
    if (models.Branch) QRCode.belongsTo(models.Branch, { foreignKey: 'branch_id', as: 'branch' });
  };

  return QRCode;
}
