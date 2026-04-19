import { useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const countryOptions = [
  { value: "Colombia", label: "Colombia" },
  ...Country.getAllCountries()
    .filter((c) => c.name !== "Colombia")
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((c) => ({ value: c.name, label: c.name })),
];

interface LocationFieldsProps {
  country: string;
  department?: string;
  city?: string;
  onChange: (field: "country" | "department" | "city", value: string) => void;
  errors?: { country?: string; department?: string; city?: string };
  labelClassName?: string;
}

export function LocationFields({
  country,
  department = "",
  city = "",
  onChange,
  errors,
  labelClassName = "text-xs font-medium",
}: LocationFieldsProps) {
  const countryIso = useMemo(
    () => Country.getAllCountries().find((c) => c.name === country)?.isoCode ?? null,
    [country],
  );

  const stateOptions = useMemo(() => {
    if (!countryIso) return [];
    return State.getStatesOfCountry(countryIso)
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .map((s) => ({ value: s.name, label: s.name, isoCode: s.isoCode }));
  }, [countryIso]);

  const stateIso = useMemo(
    () => stateOptions.find((s) => s.value === department)?.isoCode ?? null,
    [stateOptions, department],
  );

  const cityOptions = useMemo(() => {
    if (!countryIso || !stateIso) return [];
    return City.getCitiesOfState(countryIso, stateIso)
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .map((c) => ({ value: c.name, label: c.name }));
  }, [countryIso, stateIso]);

  const handleCountryChange = (val: string) => {
    onChange("country", val);
    onChange("department", "");
    onChange("city", "");
  };

  const handleDepartmentChange = (val: string) => {
    onChange("department", val);
    onChange("city", "");
  };

  const deptLabel = countryIso === "CO" ? "Departamento" : "Estado / región";
  const cityLabel = countryIso === "CO" ? "Municipio" : "Ciudad";

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label className={labelClassName}>País</Label>
        <Combobox
          value={country}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder="Selecciona un país"
          searchPlaceholder="Buscar país..."
          emptyText="País no encontrado"
        />
        {errors?.country && <p className="text-xs text-destructive">{errors.country}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className={labelClassName}>{deptLabel}</Label>
        {stateOptions.length > 0 ? (
          <Combobox
            value={department}
            onChange={handleDepartmentChange}
            options={stateOptions}
            placeholder="Selecciona..."
            searchPlaceholder={`Buscar ${deptLabel.toLowerCase()}...`}
            emptyText="No encontrado"
          />
        ) : (
          <Input
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            placeholder={deptLabel}
          />
        )}
        {errors?.department && <p className="text-xs text-destructive">{errors.department}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className={labelClassName}>{cityLabel}</Label>
        {cityOptions.length > 0 ? (
          <Combobox
            value={city}
            onChange={(v) => onChange("city", v)}
            options={cityOptions}
            placeholder="Selecciona..."
            searchPlaceholder={`Buscar ${cityLabel.toLowerCase()}...`}
            emptyText="No encontrado"
          />
        ) : (
          <Input
            value={city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder={cityLabel}
          />
        )}
        {errors?.city && <p className="text-xs text-destructive">{errors.city}</p>}
      </div>
    </div>
  );
}
