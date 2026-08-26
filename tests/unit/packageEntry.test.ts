import 'mazey-dayspan-vuetify/style.css'
import { describe, expect, it } from 'vitest'
import { DsCalendar } from 'mazey-dayspan-vuetify'

describe('package source aliases', () => {
  it('resolve the root entry and public stylesheet without built files', () => {
    expect(DsCalendar).toBeDefined()
  })
})
