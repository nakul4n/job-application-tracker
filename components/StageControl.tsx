import { updateStageAction } from "@/actions/application-actions";
import { stageLabels, stageOptions } from "@/lib/stages";
import type { ApplicationStage } from "@prisma/client";

export function StageControl({
  id,
  stage,
}: {
  id: string;
  stage: ApplicationStage;
}) {
  return (
    <form action={updateStageAction} className="cluster">
      <input name="id" type="hidden" value={id} />
      <label className="srOnly" htmlFor={`stage-${id}`}>Update stage</label>
      <select id={`stage-${id}`} name="stage" defaultValue={stage} className="searchInput">
        {stageOptions.map((value) => (
          <option key={value} value={value}>{stageLabels[value]}</option>
        ))}
      </select>
      <button className="button secondary small" type="submit">Update stage</button>
    </form>
  );
}
