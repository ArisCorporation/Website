export { IShipComponent };

declare global {
  interface IShipComponent {
    id: string;
    name: string;
    slug: string;
    size: number;
    grade: number;
    type: string;
    manufacturer: ICompany;
    description: string;
    durabilityHealth: number;
    durabilityLifetime: number;
    powerConnectionBase: number;
    powerConnectionDraw: number;
    heatConnectionThermalEngeryBase: number;
    heatConnectionThermalEngeryDraw: number;
    heatConnectionCoolingRate: number;
    ppOutput: number;
    shieldHealth: number;
    shieldRegeneration: number;
    shieldDownedDelay: number;
    shieldDamageDelay: number;
    coolerRate: number;
    qdFuelRate: number;
    qdJumpRange: number;
    qdDefaultJumpSpeed: number;
    qdDefaultCooldown: number;
    qdDefaultStage1Acc: number;
    qdDefaultStage2Acc: number;
    qdDefaultJumpSpoolUpTime: number;
    qdSplineJumpSpeed: number;
    qdSplineJumpCooldown: number;
    qdSplineJumpStage1Acc: number;
    qdSplineJumpStage2Acc: number;
    qdSplineJumpSpoolUpTime: number;
  }
}
