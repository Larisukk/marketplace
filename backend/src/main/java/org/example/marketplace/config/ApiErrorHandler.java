// src/main/java/.../config/ApiErrorHandler.java
package org.example.marketplace.config;

import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestControllerAdvice
public class ApiErrorHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (var err : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(err.getField(), Optional.ofNullable(err.getDefaultMessage()).orElse("Invalid"));
        }
        var body = Map.of(
                "message", "Validare eșuată",
                "errors", fieldErrors
        );
        return ResponseEntity.badRequest().body(body);
    }
}
