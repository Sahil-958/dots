vim.diagnostic.config({
    signs = true,
    underline = true,
    severity_sort = true,
    virtual_text = {
        spacing = 4,
        format = function(diagnostic)
            local source = diagnostic.source
            local line = diagnostic.message
            if source then
                line = line .. ' : ' .. source
            end
            return line
        end
    },
    update_in_insert = true,
})
