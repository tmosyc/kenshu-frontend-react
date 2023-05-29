import classNames from "./App.module.css";
import { StrictMode, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";

const fetchList = () =>
  fetch("http://localhost:8000/api/tasks").then((res) => res.json());

const EditForm = ({ id, taskId, taskTitle, updateTask, setText }) => {
  if (id === taskId) {
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

export const App = () => {
  const queryClient = useQueryClient();
  const [id, setId] = useState("");
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

  const updateMutation = useMutation({
    mutationFn: (taskId) => {
      return axios({
        method: "patch",
        url: `http://localhost:8000/api/tasks/${taskId}`,
        data: { title: text },
      });
    },
    onSuccess: () => {
      mutation.mutate();
    },
  });

  const updateTask = (e, taskId) => {
    e.preventDefault();
    setId(null);
    updateMutation.mutate(taskId);
  };

  const completeMutation = useMutation({
    mutationFn: (taskId) => {
      return axios({
        method: "patch",
        url: `http://localhost:8000/api/tasks/${taskId}`,
        data: { finishedAt: now },
      });
    },
    onSuccess() {
      refetch();
    },
  });

  if (isLoading || !data) return <p>Loading...</p>;

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
              onClick={() => setId(task.id)}
            >
              <EditForm
                id={id}
                taskId={task.id}
                taskTitle={task.title}
                setText={setText}
                updateTask={updateTask}
              />
              編集
            </button>
            <button
              className={classNames.completeButton}
              onClick={() => completeMutation.mutate(task.id)}
            >
              完了
            </button>
          </li>
        ))}
      </ul>
    </StrictMode>
  );
};
