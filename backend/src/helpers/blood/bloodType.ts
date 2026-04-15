import { BloodGroup } from "../../enums/bloodTypes.enum";

export function getCompatibleDonors(receiver: BloodGroup): BloodGroup[] {
  const table: Record<BloodGroup, BloodGroup[]> = {
    [BloodGroup.ONeg]:  [BloodGroup.ONeg],
    [BloodGroup.OPos]:  [BloodGroup.OPos, BloodGroup.ONeg],
    [BloodGroup.ANeg]:  [BloodGroup.ANeg, BloodGroup.ONeg],
    [BloodGroup.APos]:  [BloodGroup.APos, BloodGroup.ANeg, BloodGroup.OPos, BloodGroup.ONeg],
    [BloodGroup.BNeg]:  [BloodGroup.BNeg, BloodGroup.ONeg],
    [BloodGroup.BPos]:  [BloodGroup.BPos, BloodGroup.BNeg, BloodGroup.OPos, BloodGroup.ONeg],
    [BloodGroup.ABNeg]: [BloodGroup.ABNeg, BloodGroup.ANeg, BloodGroup.BNeg, BloodGroup.ONeg],
    [BloodGroup.ABPos]: Object.values(BloodGroup) as BloodGroup[]
  };

  return table[receiver];
}
