"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"
import type { MenuCategory, MenuCollection } from "../mega-menu"
import { NavbarLink, type NavigationLink } from "../navigation-links"


const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: MenuCategory[]
  collections?: MenuCollection[]
  brandName: string
  links?: NavigationLink[]
}

const SideMenu = ({ regions, locales, currentLocale, categories = [], collections = [], brandName, links = [] }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/0 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="fixed inset-2 z-[51] flex flex-col text-sm text-ui-fg-on-color">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full overflow-y-auto gap-8 bg-homestead-forest rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button aria-label="Close menu" data-testid="close-menu-button" onClick={close}>
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {Object.entries(SideMenuItems).map(([name, href]) => {
                        return (
                          <li key={name}>
                            <LocalizedClientLink
                              href={href}
                              className="font-nav text-2xl font-medium leading-10 tracking-wide hover:text-ui-fg-disabled"
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                      {links.filter(link => link.enabled).map((link, index) => <li key={`custom-${index}`}><NavbarLink link={link} onClick={close} className="font-nav text-2xl font-medium leading-10 tracking-wide hover:text-ui-fg-disabled" /></li>)}
                    </ul>
                    <div className="grid gap-5">
                      {!!categories.length && <details><summary className="cursor-pointer py-2 text-lg font-medium">Shop by category</summary><ul className="mt-3 grid gap-4">{categories.map((category) => <li key={category.id}><LocalizedClientLink href={`/categories/${category.handle}`} onClick={close}>{category.name}</LocalizedClientLink>{!!category.children.length && <ul className="ml-4 mt-3 grid gap-3 text-neutral-300">{category.children.map((child) => <li key={child.id}><LocalizedClientLink href={`/categories/${child.handle}`} onClick={close}>{child.name}</LocalizedClientLink></li>)}</ul>}</li>)}</ul></details>}
                      {!!collections.length && <details><summary className="cursor-pointer py-2 text-lg font-medium">Collections</summary><ul className="mt-3 grid gap-4">{collections.map((collection) => <li key={collection.id}><LocalizedClientLink href={`/collections/${collection.handle}`} onClick={close}>{collection.title}</LocalizedClientLink></li>)}</ul></details>}
                    </div>
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} {brandName}. All rights
                        reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
