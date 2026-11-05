{{- define "composeBridge.externalResourceName" -}}
{{- $description := index . 0 -}}
{{- $value := required $description (index . 1) | toString -}}
{{- $valid := and (le (len $value) 253) (regexMatch "^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$" $value) -}}
{{- range (splitList "." $value) -}}
  {{- if gt (len .) 63 -}}
    {{- $valid = false -}}
  {{- end -}}
{{- end -}}
{{- if not $valid -}}
  {{- fail (printf "%s; got %q" $description $value) -}}
{{- end -}}
{{- $value | quote -}}
{{- end -}}

{{- define "composeBridge.externalResourceKey" -}}
{{- $description := index . 0 -}}
{{- $value := required $description (index . 1) | toString -}}
{{- if or (gt (len $value) 253) (not (regexMatch "^[-._a-zA-Z0-9]+$" $value)) -}}
  {{- fail (printf "%s; got %q" $description $value) -}}
{{- end -}}
{{- $value | quote -}}
{{- end -}}

{{- define "composeBridge.subdomain" -}}
{{- $value := .Values.uds.subdomain | default .Release.Namespace | toString -}}
{{- if or (gt (len $value) 63) (not (regexMatch "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$" $value)) -}}
  {{- fail (printf "effective SUBDOMAIN must be a DNS-1123 label (lowercase alphanumeric characters or '-', starting and ending with alphanumeric, at most 63 characters); got %q" $value) -}}
{{- end -}}
{{- $value -}}
{{- end -}}
