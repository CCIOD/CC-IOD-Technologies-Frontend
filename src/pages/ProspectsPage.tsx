import { RiBankCard2Line, RiLogoutBoxRLine } from "react-icons/ri"
import { Button } from "../components/pure/Button"

export const ProspectsPage = () => {
  const handleClick = () => {}
  return (
    <>
      <div className="flex gap-2 flex-wrap mb-5">
      <Button onClick={handleClick}>
          <span className="hidden sm:block">Btn Blue</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      <Button color="theme">
          <span className="hidden sm:block">Btn Theme</span>
        </Button>
      <Button color="green">
          <span className="hidden sm:block">Btn green</span>
        </Button>
      <Button color="warning">
          <span className="">Btn warning</span>
          <RiBankCard2Line className="" size={24} />
      </Button>
      <Button color="failure">
          <span className="hidden sm:block">Btn failure</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      <Button color="sky">
          <span className="hidden sm:block">Btn sky</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
      <Button onClick={handleClick} outline>
          <span className="hidden sm:block">Btn Blue</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      <Button color="theme" outline>
          <span className="hidden sm:block">Btn theme outline</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      <Button color="green" outline outlineColor>
          <span className="hidden sm:block">Btn green</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      <Button color="warning" outlineColor>
          <span className="hidden sm:block">Btn warning</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      <Button color="failure" outline>
          <span className="hidden sm:block">Btn failure</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      <Button color="sky" outline>
          <span className="hidden sm:block">Btn sky</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-5">
        <Button color="green" outline outlineColor size="sm">
          <span className="hidden sm:block">Btn green</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
        <Button color="warning" size="sm">
          <span className="hidden sm:block">warning</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-5">
        <Button color="sky" size="md">
          <span className="hidden sm:block">Btn green</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
        <Button color="theme" outline size="md">
          <span className="hidden sm:block">warning</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      </div>
    </> 
  )
}
