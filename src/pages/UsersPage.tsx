import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { TableActions } from "../components/table/TableActions";
import { useContext, useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";
import {
  createData,
  deleteData,
  getAllData,
  updateData,
} from "../services/api.service";
import { ErrMessage } from "../components/generic/ErrMessage";
import { DataRowUsers, IUserForm } from "../interfaces/users.interface";
import { UserForm } from "../components/modalForms/UserForm";
import { AppContext } from "../context/AppContext";

export const UsersPage = () => {
  const { modalPass } = useContext(AppContext);
  const { toggleModalPass } = modalPass;

  const [usersData, setUsersData] = useState<DataRowUsers[]>([]);
  const [userData, setUserData] = useState<DataRowUsers | null>(null);
  const [userID, setUserID] = useState<number | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("");

  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean) => {
    setErrorMessage("");
    setIsOpenModal(value);
  };

  const getAllUsers = async () => {
    setIsLoadingTable(true);
    try {
      const res = await getAllData("users");
      const data: DataRowUsers[] = res.data || [];
      setUsersData(data);
    } catch (error) {
      setUsersData([]);
    } finally {
      setIsLoadingTable(false);
    }
  };
  useEffect(() => {
    getAllUsers();
  }, []);

  const handleCreate = async (data: IUserForm) => {
    setIsLoadingForm(true);
    try {
      const res = await createData("users", data);
      toggleModal(false);
      setUsersData((prev) => [...prev, res.data!]);
      alertTimer(`El usuario se ha agregado`, "success");
      setErrorMessage("");
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoadingForm(false);
    }
  };
  const handleUpdate = async (data: IUserForm) => {
    setIsLoadingForm(true);
    try {
      const res = await updateData("users", userID as number, {
        name: data.name,
        email: data.email,
        role_id: data.role_id,
      });
      if (res.success) {
        const updatedUserData: DataRowUsers = res.data!;
        setUsersData((prev) =>
          prev.map((user) =>
            user.id === userID ? { ...user, ...updatedUserData } : user
          )
        );
        toggleModal(false);
        alertTimer(`El usuario se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoadingForm(false);
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
          if (response.success) {
            setUsersData((prev) => prev.filter((user) => user.id !== id));
            alertTimer("El usuario ha sido eliminado", "success");
          }
        } catch (error) {
          const err = error as ApiResponse;
          alertTimer(err.message, "error");
        }
      }
    });
  };

  const handleError = (error: ApiResponse) => {
    if (error) setErrorMessage(error.message!);
    alertTimer("Ha ocurrido un error", "error");
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
            toggleModal(true);
            setUserID(row.id);
            setUserData(row);
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
          setTitleModal("Agregar Usuario");
          setUserData(null);
          setUserID(null);
        }}
        isLoading={isLoadingTable}
      />
      <Modal
        title={titleModal}
        isOpen={isOpenModal}
        toggleModal={toggleModal}
        size="sm"
        backdrop
      >
        <UserForm
          toggleModal={toggleModal}
          btnText={userID ? "Actualizar" : "Agregar"}
          handleSubmit={(data) =>
            userID ? handleUpdate(data) : handleCreate(data)
          }
          userData={userData}
          isLoading={isLoadingForm}
        />
        <ErrMessage message={errorMessage} center />
      </Modal>
    </>
  );
};
