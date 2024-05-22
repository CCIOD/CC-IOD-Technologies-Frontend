import { FC } from "react";
import { Button } from "../generic/Button";
import { Field, FieldArray, Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { carrierSchema } from "../../utils/FormSchema";
import {
  relationshipValues,
  SelectableItem,
} from "../../interfaces/interfaces";
import { FormikArray } from "../Inputs/FormikArray";
import { RiAddFill } from "react-icons/ri";
import {
  DataRowCarriers,
  ICarrierForm,
} from "../../interfaces/carriers.interface";
import { formatDate } from "../../utils/format";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: ICarrierForm) => void;
  btnText: "Agregar" | "Actualizar";
  carriers: SelectableItem[];
  carrierData: DataRowCarriers | null;
};

export const CarrierForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
  carriers,
  carrierData = null,
}) => {
  const initialData: ICarrierForm = {
    residence_area: "",
    placement_date: "",
    placement_time: "",
    electronic_bracelet: "",
    beacon: "",
    wireless_charger: "",
    information_emails: [""],
    house_arrest: "",
    installer_name: "",
    observations: "",
    client_id: carriers.length > 0 ? (carriers[0].id as number) : 0,
    relationship_id: 1,
  };
  const client_id_base = carriers.length > 0 ? (carriers[0].id as number) : 0;
  const formikInitialValues: ICarrierForm = carrierData
    ? {
        residence_area: carrierData.residence_area || "",
        placement_date: formatDate(carrierData.placement_date) || "",
        placement_time: carrierData.placement_time || "",
        electronic_bracelet: carrierData.electronic_bracelet || "",
        beacon: carrierData.beacon || "",
        wireless_charger: carrierData.wireless_charger || "",
        information_emails: carrierData.information_emails
          ? JSON.parse(carrierData.information_emails)
          : [],
        house_arrest: carrierData.house_arrest || "",
        installer_name: carrierData.installer_name || "",
        observations: carrierData.observations || "",
        client_id: carrierData.id || client_id_base,
        relationship_id: carrierData.relationship_id || 1,
      }
    : initialData;

  return (
    <>
      {carriers.length > 0 || btnText === "Actualizar" ? (
        <div className="h-full py-2 flex flex-col justify-between">
          <Formik
            initialValues={formikInitialValues}
            validationSchema={carrierSchema}
            onSubmit={(data) => handleSubmit(data)}
            enableReinitialize={true}
          >
            {({ values }) => (
              <Form className="w-full flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                  {!carrierData && (
                    <FormikSelect
                      label="Selecciona un Cliente"
                      name="client_id"
                      correctColor="green"
                      options={carriers}
                    />
                  )}
                  <FormikInput
                    type="text"
                    required
                    label="Zona de residencia"
                    name="residence_area"
                    placeholder="Introduce la zona de resicencia"
                    correctColor="green"
                  />
                  <FormikInput
                    type="date"
                    required
                    label="Fecha de colocación"
                    name="placement_date"
                    correctColor="green"
                  />
                  <FormikInput
                    type="time"
                    required
                    label="Hora de colocación"
                    name="placement_time"
                    correctColor="green"
                  />
                  {!carrierData && (
                    <>
                      <FormikInput
                        type="text"
                        required
                        label="Brazalete Electrónico"
                        name="electronic_bracelet"
                        placeholder="Introduce el brazalete electrónico"
                        correctColor="green"
                      />
                      <FormikInput
                        type="text"
                        required
                        label="BEACON"
                        name="beacon"
                        placeholder="Introduce el BEACON"
                        correctColor="green"
                      />
                      <FormikInput
                        type="text"
                        required
                        label="Cargador Inalámbrico"
                        name="wireless_charger"
                        placeholder="Introduce el cargador inalámbrico"
                        correctColor="green"
                      />
                    </>
                  )}
                  <FieldArray name="information_emails">
                    {({ remove, push }) => (
                      <div>
                        <span>Correos para información</span>
                        <div className="flex items-center gap-2 flex-wrap my-2">
                          <Button
                            type="button"
                            size="min"
                            color="green"
                            onClick={() => push("")}
                          >
                            <RiAddFill size={24} />
                          </Button>
                          {values.information_emails.map(
                            (_: string, index: number) => (
                              <FormikArray
                                placeholder="Email"
                                key={index}
                                name={`information_emails.${index}`}
                                index={index}
                                remove={remove}
                                length={values.information_emails.length}
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </FieldArray>
                  <FormikInput
                    type="text"
                    required
                    label="Arraigo Domiciliario"
                    name="house_arrest"
                    placeholder="Introduce el arraigo domiciliario"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Nombre del Instalador"
                    name="installer_name"
                    placeholder="Introduce el nombre del instalador"
                    correctColor="green"
                  />
                  <FormikSelect
                    label="Selecciona un Parentesco"
                    name="relationship_id"
                    correctColor="green"
                    options={relationshipValues}
                  />
                </div>
                <div>
                  <label>Observaciones</label>
                  <Field
                    as="textarea"
                    name="observations"
                    className="w-full min-h-32 max-h-32 app-bg border"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button color="gray" onClick={() => toggleModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    color={`${btnText === "Agregar" ? "blue" : "green"}`}
                  >
                    {btnText}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      ) : (
        <span>Al parecer no hay clientes que puedan ser prospectos</span>
      )}
    </>
  );
};
