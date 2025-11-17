import { FixedCost } from '../models/FixedCost.js';
import { VariableCost } from '../models/VariableCost.js';
import { FxRate } from '../models/FxRate.js';
import { Route } from '../models/Route.js';
import { Aircraft } from '../models/Aircraft.js';
import { CalculationLog } from '../models/CalculationLog.js';

/**
 * Serviço de cálculos de custos operacionais
 */
export class CalculationService {
  /**
   * Calcula o custo base por hora
   * @param {string} aircraftId - ID da aeronave
   * @returns {Promise<Object>} Resultado do cálculo
   */
  static async calculateBaseCostPerHour(aircraftId) {
    const aircraft = await Aircraft.findById(aircraftId);
    if (!aircraft) {
      throw new Error('Aircraft not found');
    }

    const fixedCosts = await FixedCost.findByAircraftId(aircraftId);
    const variableCosts = await VariableCost.findByAircraftId(aircraftId);
    const fxRate = await FxRate.getCurrent();

    console.log(`[Cálculo] Aircraft: ${aircraftId}`);
    console.log(`[Cálculo] FixedCosts encontrado:`, fixedCosts ? 'SIM' : 'NÃO');
    console.log(`[Cálculo] VariableCosts encontrado:`, variableCosts ? 'SIM' : 'NÃO');
    console.log(`[Cálculo] FxRate:`, fxRate ? `R$ ${fxRate.usd_to_brl}` : 'NÃO ENCONTRADO');

    if (!fxRate) {
      throw new Error('Exchange rate not found');
    }

    const monthlyHours = parseFloat(aircraft.monthly_hours) || 0;

    console.log(`[Cálculo] Monthly Hours: ${monthlyHours}`);

    if (monthlyHours === 0) {
      throw new Error('Monthly hours must be greater than 0');
    }

    // Declarar avgLegTime no escopo da função para uso em todo o método
    const avgLegTime = parseFloat(aircraft.avg_leg_time) || 0;

    // Conversão de fixo → hora
    let fixedCostPerHour = 0;
    if (fixedCosts) {
      console.log(`[Cálculo] Calculando custos fixos...`);
      // Salário fixo mensal da tripulação (usado nos cálculos principais)
      const crewMonthly = parseFloat(fixedCosts.crew_monthly) || 0;
      
      const hangarMonthly = parseFloat(fixedCosts.hangar_monthly) || 0;
      const ecFixedUSD = parseFloat(fixedCosts.ec_fixed_usd) || 0;
      const insurance = parseFloat(fixedCosts.insurance) || 0;
      const administration = parseFloat(fixedCosts.administration) || 0;

      // EC Fixo convertido de USD para BRL
      const ecFixedBRL = ecFixedUSD * fxRate.usd_to_brl;

      const totalFixedMonthly = crewMonthly + hangarMonthly + ecFixedBRL + insurance + administration;
      fixedCostPerHour = totalFixedMonthly / monthlyHours;
      console.log(`[Cálculo] Total Fixo Mensal: R$ ${totalFixedMonthly.toFixed(2)}`);
      console.log(`[Cálculo] Fixo por Hora: R$ ${fixedCostPerHour.toFixed(2)}`);
    } else {
      console.warn(`[Cálculo] ATENÇÃO: Custos fixos não encontrados para aircraft ${aircraftId}`);
    }

    // Custos variáveis por hora
    let variableCostPerHour = 0;
    if (variableCosts) {
      console.log(`[Cálculo] Calculando custos variáveis...`);
      // Consumo em litros por hora
      let fuelLitersPerHour = parseFloat(variableCosts.fuel_liters_per_hour) || 0;
      const fuelPricePerLiter = parseFloat(variableCosts.fuel_price_per_liter) || 0;
      
      // Se não tiver litros/hora, mas tiver consumo km/L e preço por litro, calcular
      // Fórmula: (velocidade média km/h) / (consumo km/L) = litros/hora
      if (fuelLitersPerHour === 0) {
        const fuelConsumptionKmPerL = parseFloat(variableCosts.fuel_consumption_km_per_l) || 0;
        
        // Estimativa: para aeronaves comerciais, velocidade média típica é ~400-500 km/h
        // Usamos 450 km/h como estimativa conservadora
        if (fuelConsumptionKmPerL > 0) {
          const estimatedSpeedKmh = 450;
          fuelLitersPerHour = estimatedSpeedKmh / fuelConsumptionKmPerL;
        }
      }
      
      // Calcular custo de combustível por hora: litros/hora × preço/litro
      const fuelCostPerHour = fuelLitersPerHour * fuelPricePerLiter;
      
      const ecVariableUSD = parseFloat(variableCosts.ec_variable_usd) || 0;
      const ruPerLeg = parseFloat(variableCosts.ru_per_leg) || 0;
      const ccrPerLeg = parseFloat(variableCosts.ccr_per_leg) || 0;

      // EC Variável convertido de USD para BRL
      const ecVariableBRL = ecVariableUSD * fxRate.usd_to_brl;

      // RU/CCR por perna → hora
      let ruPerHour = 0;
      let ccrPerHour = 0;

      if (avgLegTime > 0) {
        ruPerHour = ruPerLeg / avgLegTime;
        ccrPerHour = ccrPerLeg / avgLegTime;
      }

      variableCostPerHour = fuelCostPerHour + ecVariableBRL + ruPerHour + ccrPerHour;
      console.log(`[Cálculo] Variável por Hora: R$ ${variableCostPerHour.toFixed(2)}`);
      console.log(`[Cálculo] - Combustível: R$ ${fuelCostPerHour.toFixed(2)}`);
      console.log(`[Cálculo] - EC Variável: R$ ${ecVariableBRL.toFixed(2)}`);
      console.log(`[Cálculo] - RU por Hora: R$ ${ruPerHour.toFixed(2)}`);
      console.log(`[Cálculo] - CCR por Hora: R$ ${ccrPerHour.toFixed(2)}`);
    } else {
      console.warn(`[Cálculo] ATENÇÃO: Custos variáveis não encontrados para aircraft ${aircraftId}`);
    }

    // Custo total base por hora
    const totalBaseCostPerHour = fixedCostPerHour + variableCostPerHour;
    
    console.log(`[Cálculo] CUSTO TOTAL BASE POR HORA: R$ ${totalBaseCostPerHour.toFixed(2)}`);

    const result = {
      fixedCostPerHour: parseFloat(fixedCostPerHour.toFixed(2)),
      variableCostPerHour: parseFloat(variableCostPerHour.toFixed(2)),
      totalBaseCostPerHour: parseFloat(totalBaseCostPerHour.toFixed(2)),
      breakdown: {
        fixed: {
          crewMonthly: parseFloat(fixedCosts?.crew_monthly || 0),
          pilotHourlyRate: parseFloat(fixedCosts?.pilot_hourly_rate || 0),
          pilotHourlyCalculated: parseFloat((monthlyHours > 0 && fixedCosts?.crew_monthly 
            ? (fixedCosts.crew_monthly / monthlyHours).toFixed(2) 
            : 0)),
          hangarMonthly: parseFloat(fixedCosts?.hangar_monthly || 0),
          ecFixedUSD: parseFloat(fixedCosts?.ec_fixed_usd || 0),
          ecFixedBRL: parseFloat(((fixedCosts?.ec_fixed_usd || 0) * fxRate.usd_to_brl).toFixed(2)),
          insurance: parseFloat(fixedCosts?.insurance || 0),
          administration: parseFloat(fixedCosts?.administration || 0),
          totalMonthly: parseFloat((
            (parseFloat(fixedCosts?.crew_monthly || 0) +
             parseFloat(fixedCosts?.hangar_monthly || 0) +
             parseFloat(fixedCosts?.ec_fixed_usd || 0) * fxRate.usd_to_brl +
             parseFloat(fixedCosts?.insurance || 0) +
             parseFloat(fixedCosts?.administration || 0))
          ).toFixed(2))
        },
        variable: {
          fuelLitersPerHour: parseFloat(variableCosts?.fuel_liters_per_hour || 0),
          fuelCostPerHour: parseFloat(((variableCosts?.fuel_liters_per_hour || 0) * (variableCosts?.fuel_price_per_liter || 0)).toFixed(2)),
          fuelConsumptionKmPerL: parseFloat(variableCosts?.fuel_consumption_km_per_l || 0),
          fuelPricePerLiter: parseFloat(variableCosts?.fuel_price_per_liter || 0),
          ecVariableUSD: parseFloat(variableCosts?.ec_variable_usd || 0),
          ecVariableBRL: parseFloat(((variableCosts?.ec_variable_usd || 0) * fxRate.usd_to_brl).toFixed(2)),
          ruPerLeg: parseFloat(variableCosts?.ru_per_leg || 0),
          ruPerHour: parseFloat((avgLegTime > 0 ? (variableCosts?.ru_per_leg || 0) / avgLegTime : 0).toFixed(2)),
          ccrPerLeg: parseFloat(variableCosts?.ccr_per_leg || 0),
          ccrPerHour: parseFloat((avgLegTime > 0 ? (variableCosts?.ccr_per_leg || 0) / avgLegTime : 0).toFixed(2))
        }
      },
      fxRate: parseFloat(fxRate.usd_to_brl),
      monthlyHours: parseFloat(monthlyHours)
    };

    // Log do cálculo
    await CalculationLog.create({
      aircraft_id: aircraftId,
      calculation_type: 'base_cost_per_hour',
      parameters: {
        fixedCosts,
        variableCosts,
        fxRate: fxRate.usd_to_brl,
        monthlyHours
      },
      result
    });

    return result;
  }

  /**
   * Calcula o custo por rota
   * @param {string} aircraftId - ID da aeronave
   * @param {string} routeId - ID da rota (opcional)
   * @returns {Promise<Object>} Resultado do cálculo
   */
  static async calculateRouteCost(aircraftId, routeId = null) {
    const baseCost = await this.calculateBaseCostPerHour(aircraftId);
    const aircraft = await Aircraft.findById(aircraftId);
    const fxRate = await FxRate.getCurrent();

    let routes;
    if (routeId) {
      const route = await Route.findById(routeId);
      routes = route ? [route] : [];
    } else {
      routes = await Route.findByAircraftId(aircraftId);
    }

    const routeCosts = routes.map(route => {
      const deceaPerHour = parseFloat(route.decea_per_hour) || 0;
      const routeCostPerHour = baseCost.totalBaseCostPerHour + deceaPerHour;

      return {
        routeId: route.id,
        origin: route.origin,
        destination: route.destination,
        deceaPerHour: parseFloat(deceaPerHour.toFixed(2)),
        baseCostPerHour: baseCost.totalBaseCostPerHour,
        totalCostPerHour: parseFloat(routeCostPerHour.toFixed(2)),
        // Estimativa de custo baseado no tempo médio da perna
        estimatedLegCost: parseFloat((routeCostPerHour * (parseFloat(aircraft.avg_leg_time) || 0)).toFixed(2))
      };
    });

    const result = {
      baseCost: baseCost.totalBaseCostPerHour,
      routes: routeCosts,
      fxRate: parseFloat(fxRate.usd_to_brl)
    };

    // Log do cálculo
    if (routes.length > 0) {
      await CalculationLog.create({
        aircraft_id: aircraftId,
        calculation_type: routeId ? 'route_cost' : 'all_routes_cost',
        parameters: { routeId, routeCount: routes.length },
        result
      });
    }

    return result;
  }

  /**
   * Calcula o custo por perna
   * @param {string} aircraftId - ID da aeronave
   * @param {number} legTime - Tempo da perna em horas (opcional, usa avg_leg_time se não fornecido)
   * @param {string} routeId - ID da rota (opcional, para incluir DECEA)
   * @returns {Promise<Object>} Resultado do cálculo
   */
  static async calculateLegCost(aircraftId, legTime = null, routeId = null) {
    const aircraft = await Aircraft.findById(aircraftId);
    const baseCost = await this.calculateBaseCostPerHour(aircraftId);
    const fxRate = await FxRate.getCurrent();

    const actualLegTime = legTime || parseFloat(aircraft.avg_leg_time) || 0;
    if (actualLegTime === 0) {
      throw new Error('Leg time must be provided or aircraft must have avg_leg_time configured');
    }

    let deceaPerHour = 0;
    let route = null;

    if (routeId) {
      route = await Route.findById(routeId);
      if (route) {
        deceaPerHour = parseFloat(route.decea_per_hour) || 0;
      }
    }

    const costPerHour = baseCost.totalBaseCostPerHour + deceaPerHour;
    const legCost = costPerHour * actualLegTime;

    const result = {
      legTime: parseFloat(actualLegTime.toFixed(2)),
      baseCostPerHour: baseCost.totalBaseCostPerHour,
      deceaPerHour: parseFloat(deceaPerHour.toFixed(2)),
      totalCostPerHour: parseFloat(costPerHour.toFixed(2)),
      totalLegCost: parseFloat(legCost.toFixed(2)),
      route: route ? {
        id: route.id,
        origin: route.origin,
        destination: route.destination
      } : null,
      fxRate: parseFloat(fxRate.usd_to_brl)
    };

    // Log do cálculo
    await CalculationLog.create({
      aircraft_id: aircraftId,
      calculation_type: 'leg_cost',
      parameters: { legTime: actualLegTime, routeId },
      result
    });

    return result;
  }

  /**
   * Calcula a projeção mensal
   * @param {string} aircraftId - ID da aeronave
   * @returns {Promise<Object>} Resultado do cálculo
   */
  static async calculateMonthlyProjection(aircraftId) {
    const aircraft = await Aircraft.findById(aircraftId);
    const baseCost = await this.calculateBaseCostPerHour(aircraftId);
    const routes = await Route.findByAircraftId(aircraftId);
    const fxRate = await FxRate.getCurrent();

    const monthlyHours = parseFloat(aircraft.monthly_hours) || 0;
    const avgLegTime = parseFloat(aircraft.avg_leg_time) || 0;

    // Média de DECEA por hora (baseada nas rotas)
    let avgDeceaPerHour = 0;
    if (routes.length > 0) {
      const totalDecea = routes.reduce((sum, route) => sum + (parseFloat(route.decea_per_hour) || 0), 0);
      avgDeceaPerHour = totalDecea / routes.length;
    }

    const avgCostPerHour = baseCost.totalBaseCostPerHour + avgDeceaPerHour;
    const monthlyProjection = avgCostPerHour * monthlyHours;

    // Distribuição por categoria
    const fixedMonthly = (baseCost.fixedCostPerHour * monthlyHours);
    const variableMonthly = (baseCost.variableCostPerHour * monthlyHours);
    const deceaMonthly = (avgDeceaPerHour * monthlyHours);

    const categoryDistribution = {
      fixed: {
        value: parseFloat(fixedMonthly.toFixed(2)),
        percentage: parseFloat(((fixedMonthly / monthlyProjection) * 100).toFixed(2))
      },
      variable: {
        value: parseFloat(variableMonthly.toFixed(2)),
        percentage: parseFloat(((variableMonthly / monthlyProjection) * 100).toFixed(2))
      },
      decea: {
        value: parseFloat(deceaMonthly.toFixed(2)),
        percentage: parseFloat(((deceaMonthly / monthlyProjection) * 100).toFixed(2))
      }
    };

    const result = {
      monthlyHours: parseFloat(monthlyHours.toFixed(2)),
      baseCostPerHour: baseCost.totalBaseCostPerHour,
      avgDeceaPerHour: parseFloat(avgDeceaPerHour.toFixed(2)),
      avgCostPerHour: parseFloat(avgCostPerHour.toFixed(2)),
      monthlyProjection: parseFloat(monthlyProjection.toFixed(2)),
      categoryDistribution,
      estimatedLegs: avgLegTime > 0 ? Math.round(monthlyHours / avgLegTime) : 0,
      fxRate: parseFloat(fxRate.usd_to_brl)
    };

    // Log do cálculo
    await CalculationLog.create({
      aircraft_id: aircraftId,
      calculation_type: 'monthly_projection',
      parameters: { monthlyHours },
      result
    });

    return result;
  }

  /**
   * Calcula todos os custos de uma aeronave (relatório completo)
   * @param {string} aircraftId - ID da aeronave
   * @returns {Promise<Object>} Resultado completo
   */
  static async calculateComplete(aircraftId) {
    const [
      baseCost,
      routeCosts,
      monthlyProjection
    ] = await Promise.all([
      this.calculateBaseCostPerHour(aircraftId),
      this.calculateRouteCost(aircraftId),
      this.calculateMonthlyProjection(aircraftId)
    ]);

    const aircraft = await Aircraft.findById(aircraftId);
    const fxRate = await FxRate.getCurrent();

    return {
      aircraft: {
        id: aircraft.id,
        name: aircraft.name,
        registration: aircraft.registration,
        model: aircraft.model
      },
      fxRate: parseFloat(fxRate.usd_to_brl),
      baseCostPerHour: baseCost.totalBaseCostPerHour,
      breakdown: baseCost.breakdown,
      routeCosts: routeCosts.routes,
      monthlyProjection,
      calculatedAt: new Date().toISOString()
    };
  }
}

