import classNames from "./App.module.css";
import { StrictMode, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";

const fetchList = () =>
  fetch("http://localhost:8000/api/tasks").then((res) => res.json());

export const App = () => {
  const queryClient = useQueryClient();
  const [id, setId] = useState({ id: "", changeType: "" });
  const [text, setText] = useState("");
  const now = new Date();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchList,
  });

  const mutation = useMutation({
    mutationFn: () => {
      return axios.post("http://localhost:8000/api/tasks");
    },
    onSuccess: () => {
      queryClient.refetchQueries(["tasks"]);
    },
  });

  if (isLoading || !data) return <p>Loading...</p>;

  const updateTask = (e, taskId) => {
    e.preventDefault();
    setId({ id: "", changeType: "update" });
    axios({
      method: "patch",
      url: `http://localhost:8000/api/tasks/${taskId}`,
      data: { title: text, finishedAt: null },
    }).then(() => {
      mutation.mutate();
    });
  };

  const updateText = (taskId, taskTitle) => {
    if (id.id === taskId && id.changeType === "update") {
      return (
        <StrictMode>
          <form onSubmit={(e) => updateTask(e, taskId)}>
            <input
              type="text"
              placeholder={taskTitle}
              onChange={(event) => setText(event.target.value)}
            ></input>
          </form>
        </StrictMode>
      );
    }
  };

  const finish = async (taskId: string) => {
    await axios({
      method: "patch",
      url: `http://localhost:8000/api/tasks/${taskId}`,
      data: { finishedAt: now },
    });
    refetch();
  };

  return (
    <StrictMode>
      <ul className={classNames.heading}>
        <button
          className={classNames.button}
          onClick={() => {
            mutation.mutate();
          }}
        >
          タスクの追加
        </button>
        {data.tasks.map((task) => (
          <li className={classNames.title} key={task.id}>
            <p
              className={
                task.finishedAt !== null ? classNames.completeText : ""
              }
            >
              {task.title}
            </p>
            <button
              className={classNames.updateButton}
              onClick={() => setId({ id: task.id, changeType: "update" })}
            >
              {updateText(task.id, task.title)}
              編集
            </button>

            <button
              className={classNames.completeButton}
              onClick={() => finish(task.id)}
            >
              完了
            </button>
          </li>
        ))}
      </ul>
    </StrictMode>
  );
};
