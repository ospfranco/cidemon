export interface AppcenterRepoDto {
  id: string;
  name: string;
  owner: OwnerDto;
}

interface OwnerDto {
  id: string;
  name: string;
}
