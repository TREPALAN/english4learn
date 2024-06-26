import { useState, useEffect, useRef } from "react";
import SelectActivityType from "./GetActivityType";
import { useParams } from "react-router-dom";
import api from "../../authentication/api";
import { ActivityContextProvider } from "./activityContext";
import "../../css/activity.css";
import LessonConcuded from "./comcludes/LessonConcluded";
import ErrorHandler from "../Error";
import Loading from "../Loading";

interface score {
  correct: number;
  total: number;
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const footer = document.querySelector(".activityFooter");
      const NextButton = document.querySelector<any>(".NextButton");
      if (!footer?.classList.contains("disabled")) {
        NextButton?.click();
      }
    }
  });
});

function ActivityRoot() {
  const [concludedLesson, setConcudedLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswered, setIsAnswered] = useState(false);
  const [activities, setActivities] = useState([]);
  const [theme, setTheme] = useState<any>({});
  const [activity, setActivity] = useState<any>({});
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const themeId = useParams().themeId;
  if (!themeId) setError(true);
  const score = useRef<score>({ correct: 0, total: 0 }); //Track user score

  useEffect(() => {
    const activityFooter = document.querySelector(".activityFooter");
    if (isAnswered) {
      activityFooter?.classList.remove("hidden");
      activityFooter?.classList.remove("disabled");
    } else {
      activityFooter?.classList.add("hidden");
      activityFooter?.classList.add("disabled");
    }
  }, [isAnswered, activity]);

  useEffect(() => {
    setActivity(activities[index]);
  }, [activities, index]);

  async function handleNext() {
    setIsAnswered(false);
    if (index + 1 >= activities.length) {
      //  If last activity
      setIsLoading(true);
      let percentage = (score.current.correct / score.current.total) * 100;
      if (Number.isNaN(percentage)) percentage = 101; //  101 means that the activity is not a quiz
      const response = await api.post(`/activities/mark_as_done/${themeId}`, {
        percentage,
      });
      if (response.status !== 200) return setError(true);
      const hasNext = response.hasNext;
      if (!hasNext) {
        //  If lesson is finished
        setIsLoading(false);
        if (!response.lesson) return setError(true);

        let score;
        if (response.score) score = response.score + "%";
        else score = "NaN";

        const lessonWithScore = response.lesson;
        lessonWithScore.score = score;
        return setConcudedLesson(lessonWithScore); // response.lesson is the current lesson
      }
      //  If there is a next theme

      const nextTheme = response.nextTheme;
      if (!nextTheme) return setError(true);
      return window.location.replace(`/activity/${nextTheme._id}`);
    }

    //  If there is a next activity
    setIndex((prevIndex) => (prevIndex + 1) % activities.length);
  }

  useEffect(() => {
    (async () => {
      if (!themeId) return;

      setIsLoading(true);
      const response = await api.get(`/activities/${themeId}`);
      if (response.status !== 200) {
        console.log(response.message);
        setError(true);
        return;
      }

      setActivities(response.activities);
      setTheme(response.theme);
      setIsLoading(false);
    })();
  }, [themeId]);

  // Spinner if loading
  if (isLoading) return <Loading />;

  // Error message
  if (error) return <ErrorHandler />;

  // If lesson id finished
  if (concludedLesson !== null)
    return (
      <LessonConcuded lesson={concludedLesson} key={concludedLesson._id} />
    );

  // Display activities
  return (
    <div className="activityRoot container">
      {activity && (
        <ActivityContextProvider
          isAnswered={isAnswered}
          setIsAnswered={setIsAnswered}
          score={score}
          activity={activity}
          theme={theme}
        >
          {/* Header */}
          <div className="ThemeHeader">
            <div className="BackButton">
              <a href={"/select/theme/" + theme.lesson}> &#8592; Back</a>
            </div>
            {theme.name} {index + 1} / {activities.length}
          </div>

          {/* Activity wrapper */}
          <div className="activityWrapper">
            <SelectActivityType />
          </div>
        </ActivityContextProvider>
      )}

      <div className="activityFooter">
        <button onClick={handleNext} className="NextButton">
          Next &#8594;
        </button>
      </div>
    </div>
  );
}

export default ActivityRoot;
