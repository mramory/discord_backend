const userSelectFieldsNoRef = {
  id: true,
  email: true,
  name: true,
  viewName: true,
  img: true,
  role: true,
  createdAt: true,
} as const;

type TUserSelectFieldsNoRef = typeof userSelectFieldsNoRef;

export { userSelectFieldsNoRef };
export type { TUserSelectFieldsNoRef };
