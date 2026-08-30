import { jest } from '@jest/globals';
import { Op } from 'sequelize';

const mockModels = {
  Menu: {
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
  Branch: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/models/index.js', () => ({
  ...mockModels,
  Menu: mockModels.Menu,
  Branch: mockModels.Branch,
}));

const { findActiveSeasonalMenus, findOverlappingMenus, resolveMenuForQR } =
  await import('../../src/services/menuResolver.js');
const { Menu, Branch } = await import('../../src/models/index.js');

/** Sequelize usa símbolos como claves, así que el where hay que leerlo así. */
const orClause = (where) => where[Op.or];

const seasonal = (menu_id, branch_id) => ({ menu_id, branch_id, temporal: true });

beforeEach(() => {
  jest.clearAllMocks();
  Menu.findAll.mockResolvedValue([]);
  Menu.findOne.mockResolvedValue(null);
});

describe('findActiveSeasonalMenus', () => {
  it('sin sede sólo pide las temporadas de todo el restaurante', async () => {
    await findActiveSeasonalMenus(1);

    const { where } = Menu.findAll.mock.calls[0][0];
    expect(where.branch_id).toBeNull();
    expect(orClause(where)).toBeUndefined();
  });

  it('con sede pide las suyas y las del restaurante', async () => {
    await findActiveSeasonalMenus(1, { branchId: 7 });

    const { where } = Menu.findAll.mock.calls[0][0];
    expect(orClause(where)).toEqual([{ branch_id: null }, { branch_id: 7 }]);
  });

  it('con anyBranch no filtra por sede', async () => {
    await findActiveSeasonalMenus(1, { anyBranch: true });

    const { where } = Menu.findAll.mock.calls[0][0];
    expect(where.branch_id).toBeUndefined();
    expect(orClause(where)).toBeUndefined();
  });

  it('la temporada de la sede gana a la del restaurante', async () => {
    Menu.findAll.mockResolvedValue([seasonal(10, null), seasonal(11, 7)]);

    const result = await findActiveSeasonalMenus(1, { branchId: 7 });

    expect(result.map((m) => m.menu_id)).toEqual([11, 10]);
  });

  it('a igual alcance respeta el orden por fecha que trae la consulta', async () => {
    Menu.findAll.mockResolvedValue([seasonal(20, null), seasonal(21, null)]);

    const result = await findActiveSeasonalMenus(1);

    expect(result.map((m) => m.menu_id)).toEqual([20, 21]);
  });
});

describe('resolveMenuForQR', () => {
  const autoQR = { follows_active_menu: true, menu_id: null, branch_id: 7 };

  it('resuelve la temporada de la sede del código', async () => {
    Branch.findOne.mockResolvedValue({ branch_id: 7, main_menu_id: null });
    Menu.findAll.mockResolvedValue([seasonal(11, 7)]);

    const { menu, reason } = await resolveMenuForQR(autoQR, 1);

    expect(reason).toBe('seasonal');
    expect(menu.menu_id).toBe(11);
    expect(orClause(Menu.findAll.mock.calls[0][0].where)).toEqual([
      { branch_id: null },
      { branch_id: 7 },
    ]);
  });

  it('carga la sede del código filtrando por restaurante', async () => {
    Branch.findOne.mockResolvedValue({ branch_id: 7, main_menu_id: null });

    await resolveMenuForQR(autoQR, 1);

    expect(Branch.findOne).toHaveBeenCalledWith({
      where: { branch_id: 7, tenant_id: 1 },
    });
  });

  it('un código sin sede no ve las temporadas de una sucursal', async () => {
    const menu = { menu_id: 30, is_default: true };
    Menu.findAll.mockResolvedValue([]);
    Menu.findOne.mockResolvedValue(menu);

    const { reason } = await resolveMenuForQR(
      { follows_active_menu: true, menu_id: null, branch_id: null },
      1
    );

    expect(Menu.findAll.mock.calls[0][0].where.branch_id).toBeNull();
    expect(reason).toBe('main');
  });

  it('el modo fijo ignora las temporadas', async () => {
    Menu.findOne.mockResolvedValue({ menu_id: 5 });

    const { menu, reason } = await resolveMenuForQR(
      { follows_active_menu: false, menu_id: 5, branch_id: 7 },
      1
    );

    expect(reason).toBe('pinned');
    expect(menu.menu_id).toBe(5);
    expect(Menu.findAll).not.toHaveBeenCalled();
  });
});

describe('findOverlappingMenus', () => {
  it('no avisa de temporadas de otras sedes', async () => {
    await findOverlappingMenus(1, {
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      branch_id: 7,
    });

    expect(orClause(Menu.findAll.mock.calls[0][0].where)).toEqual([
      { branch_id: null },
      { branch_id: 7 },
    ]);
  });

  it('un menú de todo el restaurante se compara con todos', async () => {
    await findOverlappingMenus(1, {
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      branch_id: null,
    });

    const { where } = Menu.findAll.mock.calls[0][0];
    expect(where.branch_id).toBeUndefined();
    expect(orClause(where)).toBeUndefined();
  });

  it('sin fechas no consulta nada', async () => {
    const result = await findOverlappingMenus(1, { start_date: null, end_date: null });

    expect(result).toEqual([]);
    expect(Menu.findAll).not.toHaveBeenCalled();
  });
});
