import express from 'express';
import { AircraftController } from '../controllers/aircraftController.js';
import { FixedCostController } from '../controllers/fixedCostController.js';
import { VariableCostController } from '../controllers/variableCostController.js';
import { RouteController } from '../controllers/routeController.js';
import { FxRateController } from '../controllers/fxRateController.js';
import { CalculationController } from '../controllers/calculationController.js';
import { FlightController } from '../controllers/flightController.js';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

// Rotas de Aeronaves
router.get('/aircraft', AircraftController.list);
router.get('/aircraft/:id', AircraftController.getById);
router.post('/aircraft', AircraftController.create);
router.put('/aircraft/:id', AircraftController.update);
router.delete('/aircraft/:id', AircraftController.delete);

// Rotas de Custos Fixos
router.get('/fixed-costs/:aircraftId', FixedCostController.getByAircraft);
router.post('/fixed-costs', FixedCostController.upsert);
router.put('/fixed-costs/:id', FixedCostController.update);
router.delete('/fixed-costs/:id', FixedCostController.delete);

// Rotas de Custos Variáveis
router.get('/variable-costs/:aircraftId', VariableCostController.getByAircraft);
router.post('/variable-costs', VariableCostController.upsert);
router.put('/variable-costs/:id', VariableCostController.update);
router.delete('/variable-costs/:id', VariableCostController.delete);

// Rotas de Rotas
router.get('/routes/:aircraftId', RouteController.listByAircraft);
router.get('/routes/single/:id', RouteController.getById);
router.post('/routes', RouteController.create);
router.put('/routes/:id', RouteController.update);
router.delete('/routes/:id', RouteController.delete);

// Rotas de Taxa de Câmbio
router.get('/fx-rates', FxRateController.list);
router.get('/fx-rates/current', FxRateController.getCurrent);
router.post('/fx-rates', FxRateController.create);

// Rotas de Cálculos
router.get('/calculations/:aircraftId/base-cost', CalculationController.baseCostPerHour);
router.get('/calculations/:aircraftId/route-cost', CalculationController.routeCost);
router.get('/calculations/:aircraftId/leg-cost', CalculationController.legCost);
router.get('/calculations/:aircraftId/monthly-projection', CalculationController.monthlyProjection);
router.get('/calculations/:aircraftId/complete', CalculationController.complete);

// Rotas de Voos
router.get('/flights/:aircraftId', FlightController.list);
router.get('/flights/single/:id', FlightController.get);
router.post('/flights', FlightController.create);
router.put('/flights/:id', FlightController.update);
router.delete('/flights/:id', FlightController.delete);
router.post('/flights/:id/complete', FlightController.markAsCompleted);
router.get('/flights/:aircraftId/statistics', FlightController.getStatistics);
router.post('/flights/:aircraftId/recalculate-costs', FlightController.recalculateCosts);

// Rotas de Dashboard
router.get('/dashboard/:aircraftId', CalculationController.dashboard);

// Rotas de Usuários
router.get('/users', UserController.list);
router.get('/users/:id', UserController.getById);
router.post('/users', UserController.create);
router.put('/users/:id', UserController.update);
router.delete('/users/:id', UserController.delete);
router.delete('/users/:id/permanent', UserController.deletePermanent);
router.post('/users/login', UserController.login);

export default router;

