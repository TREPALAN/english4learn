import MediaBox from "./div/MediaBox";
import TextDiv from "./div/TextDiv";
import TableDiv from "./div/TableDiv";
import AudioDiv from "./div/AudioDiv";
import HeaderDiv from "./div/HeaderDiv";

function ReadType(props: any) {
  const { activity } = props;
  const hascontent = activity.hasMedia || activity.text || activity.table;

  return (
    <>
      {activity.header && <HeaderDiv activity={activity} />}

      {hascontent && (
        <div className="ActivityContent">
          {activity.hasMedia && <MediaBox activity={activity} />}
          {activity.text && <TextDiv activity={activity} />}
          {activity.table && <TableDiv activity={activity} />}
        </div>
      )}
      {activity.audio && <AudioDiv activity={activity} />}
    </>
  );
}

export default ReadType;
