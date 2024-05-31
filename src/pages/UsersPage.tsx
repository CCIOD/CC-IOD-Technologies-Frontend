import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";
import {
  createData,
  deleteData,
  getAllData,
  getDataById,
  updateData,
} from "../services/api.service";
import { ErrMessage } from "../components/generic/ErrMessage";
import {
  DataRowUsers,
  IPasswordForm,
  IUserForm,
} from "../interfaces/users.interface";
import { UserForm } from "../components/modalForms/UserForm";
import { ChangePasswordForm } from "../components/modalForms/ChangePasswordForm";

export const UsersPage = () => {
  const [usersData, seUsersData] = useState<DataRowUsers[]>([]);
  const [userData, setUserData] = useState<DataRowUsers | null>(null);
  const [userID, setUserID] = useState<number | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("");
  const [isOpenModalPass, setIsOpenModalPass] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean, id: number | null = null) => {
    if (!id) setTitleModal(`Agregar usuario`);
    setIsOpenModal(value);
    setUserID(id);
  };
  const toggleModalPass = (value: boolean, id: number | null = null) => {
    setIsOpenModalPass(value);
    setUserID(id);
  };

  const getAllUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("users");
      const data: DataRowUsers[] = res.data!;
      if (!data) seUsersData([]);
      seUsersData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const getUserById = async (id: number) => {
    try {
      const res = await getDataById("users", id);
      const data: DataRowUsers = res.data!;
      if (!data) setUserData(null);
      setUserData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllUsers();
  }, [action]);

  const handleCreate = async (data: IUserForm) => {
    try {
      console.log(data);

      const res = await createData("users", data);
      console.log(res);

      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El usuario se ha agregado`, "success");
      }
    } catch (error) {
      console.log(error);

      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };
  const handleUpdate = async (data: IUserForm) => {
    console.log(data);

    try {
      const res = await updateData("users", userID as number, {
        name: data.name,
        email: data.email,
        role_id: data.role_id,
      });
      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El usuario se ha actualizado`, "success");
      }
    } catch (error) {
      console.log(error);

      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };
  const handleChangePass = async (data: IPasswordForm) => {
    console.log(data);
    console.log(userID);

    try {
      const res = await updateData(
        "users/change-password",
        userID as number,
        data
      );
      if (res.success) {
        toggleModalPass(false);
        alertTimer(`La contraseña se ha actualizado`, "success");
      }
    } catch (error) {
      console.log(error);
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };

  const handleDelete = (id: number) => {
    const confirm = confirmChange({
      title: "Eliminar Usuario",
      text: `¿Está seguro de querer eliminar el Usuario con el ID ${id}?. Este cambio es irreversible.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then(async (res) => {
      if (res.success) {
        try {
          const response = await deleteData("users", id);
          if (response.success)
            alertTimer("El usuario ha sido eliminado", "success");
          setAction(!action);
        } catch (error) {
          const err = error as ApiResponse;
          alertTimer(err.message, "error");
        }
      }
    });
  };

  const columns: TableColumn<DataRowUsers>[] = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Correo",
      selector: (row) => row.email,
    },
    {
      name: "Rol",
      selector: (row) => row.role_name,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          handleChangePassword={() => toggleModalPass(true, row.id)}
          handleClickUpdate={() => {
            setTitleModal(`Editar información de ${row.name}`);
            toggleModal(true, row.id);
            getUserById(row.id);
          }}
          handleClickDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  return (
    <>
      <TableComponent<DataRowUsers>
        title="Usuarios"
        columns={columns}
        tableData={usersData}
        handleOpenModal={(value) => {
          toggleModal(value);
          setUserData(null);
        }}
        isLoading={isLoading}
      />
      <Modal
        title={titleModal}
        isOpen={isOpenModal}
        toggleModal={toggleModal}
        size="md"
        backdrop
      >
        <UserForm
          toggleModal={toggleModal}
          btnText={userID ? "Actualizar" : "Agregar"}
          handleSubmit={(data) =>
            userID ? handleUpdate(data) : handleCreate(data)
          }
          userData={userData}
        />
        <ErrMessage message={errorMessage} />
      </Modal>
      <Modal
        title="Cambiar contraseña"
        isOpen={isOpenModalPass}
        toggleModal={toggleModalPass}
        size="xs"
        backdrop
      >
        <ChangePasswordForm
          toggleModal={toggleModal}
          handleSubmit={(data) => handleChangePass(data)}
        />
        <ErrMessage message={errorMessage} />
      </Modal>
    </>
  );
};
// 229
